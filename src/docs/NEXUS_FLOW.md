# Nexus Commerce — Architecture & Flow Documentation

> Generated from forensic analysis of all 10 backend microservices.
> Last updated: 2026-02-16

---

## Diagram 1: The "Social Buying" Saga (GroupBuy)

```mermaid
sequenceDiagram
    participant UA as 👤 User A (Leader)
    participant FE as 🖥️ Frontend
    participant GW as 🔀 API Gateway
    participant GB as 📦 GroupBuy.API
    participant DB as 🗄️ PostgreSQL
    participant UB as 👥 User B (Joiner)
    participant PAY as 💳 Payment.API
    participant POS as 🏦 PayOS

    Note over UA,POS: Phase 1 — Campaign Discovery
    UA->>FE: Browse active campaigns
    FE->>GW: GET /api/groupbuys/campaigns/active
    GW->>GB: Forward
    GB->>DB: WHERE Status='Active' AND StartDate<=now<=EndDate
    DB-->>GB: Active campaigns
    GB-->>FE: Campaign[] (with GroupPrice, MinParticipants)

    Note over UA,POS: Phase 2 — Open Group Session
    UA->>FE: Click "Start Group" on campaign
    FE->>GW: POST /api/groupbuys/sessions/open
    Note right of FE: { CampaignId, UserName, Quantity: 1 }
    GW->>GB: Forward
    GB->>GB: Validate campaign.Status == "Active"
    GB->>GB: Generate 8-char InviteCode (no I/O/0/1)
    GB->>DB: Insert Session (Status: Open, Deadline: +24h)
    GB->>DB: Insert Participant (Leader, Status: Joined)
    DB-->>GB: Session created
    GB-->>FE: Session { inviteCode, deadline, currentParticipants: 1 }

    Note over UA,POS: Phase 3 — Share & Join
    UA->>UB: Share invite link (/group-buy/join/{inviteCode})
    UB->>FE: Open invite link
    FE->>GW: GET /api/groupbuys/sessions/invite/{inviteCode}
    GW->>GB: Forward
    GB-->>FE: Session details + campaign info

    UB->>FE: Click "Join Group"
    FE->>GW: POST /api/groupbuys/sessions/join
    Note right of FE: { InviteCode, UserName, Quantity: 1 }
    GW->>GB: Forward
    GB->>GB: Validate: Open, not expired, not duplicate, capacity check
    GB->>DB: Insert Participant (Status: Joined)
    GB->>DB: Increment CurrentParticipants

    alt CurrentParticipants >= MinParticipants
        GB->>DB: Session.Status → "Succeeded"
        GB->>DB: All Participants.Status → "Confirmed"
        GB-->>FE: 🎉 Group Succeeded!
        Note over FE,PAY: Phase 4 — Payment (per participant)
        FE->>GW: POST /api/payment/create
        Note right of FE: { OrderNo, Amount: GroupPrice×Qty, Items, ReturnUrl }
        GW->>PAY: Forward
        PAY->>POS: createPaymentLink()
        POS-->>PAY: checkoutUrl
        PAY-->>FE: { paymentUrl }
        FE->>UA: Redirect to PayOS checkout
        POS-->>PAY: Webhook (code: "00")
        PAY->>PAY: Status → Paid, publish PaymentCompletedEvent
    else Deadline passes (CurrentParticipants < Min)
        Note over GB,DB: Expiration Processing (Manual/Scheduled)
        GB->>DB: Session.Status → "Failed"
        GB->>DB: All Participants.Status → "Refunded"
        GB-->>FE: ❌ Group Failed — Not enough participants
    end
```

---

## Diagram 2: The "Flash Sale" Rush

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ Frontend
    participant GW as 🔀 API Gateway
    participant FS as ⚡ FlashSale.API
    participant RD as 🔴 Redis
    participant DB as 🗄️ PostgreSQL
    participant PAY as 💳 Payment.API
    participant POS as 🏦 PayOS

    Note over U,POS: Phase 1 — Discovery (Client-side countdown)
    U->>FE: Visit Homepage
    FE->>GW: GET /api/flashsales/sessions/active
    GW->>FS: Forward
    FS->>DB: WHERE Status='Active' AND StartTime<=now<=EndTime
    DB-->>FS: Active sessions (with items)
    FS-->>FE: FlashSaleSession[] (StartTime, EndTime, Items[])
    FE->>FE: Start client-side countdown timer (EndTime - now)

    Note over U,POS: Phase 2 — Stock Polling (No WebSocket)
    loop Every 5 seconds
        FE->>GW: GET /api/flashsales/items/{itemId}/stock
        GW->>FS: Forward
        FS->>RD: GET flash:item:{itemId}:stock
        RD-->>FS: remainingStock
        FS-->>FE: { itemId, remainingStock }
        FE->>FE: Update progress bar (sold / total)
    end

    Note over U,POS: Phase 3 — Purchase (Atomic Redis Lua Script)
    U->>FE: Click "Buy Now"
    FE->>GW: POST /api/flashsales/purchase
    Note right of FE: { ItemId, UserName, Quantity: 1 }
    GW->>FS: Forward
    FS->>DB: Load FlashSaleItem (check session active + time window)

    FS->>RD: EVAL Lua Script (ATOMIC)
    Note over RD: 1. Check user limit (flash:item:X:user:Y)<br/>2. Check stock (flash:item:X:stock)<br/>3. DECRBY stock<br/>4. INCRBY user count

    alt Lua returns 1 (Success)
        RD-->>FS: ✅ Stock reserved
        FS->>DB: Insert FlashSaleOrder (Status: Confirmed, UnitPrice: FlashPrice)
        FS-->>FE: FlashSaleOrder { id, unitPrice, status }
        
        Note over FE,POS: Phase 4 — Payment
        FE->>GW: POST /api/payment/create
        GW->>PAY: Forward
        PAY->>POS: createPaymentLink()
        POS-->>PAY: checkoutUrl
        PAY-->>FE: { paymentUrl }
        FE->>U: Redirect to PayOS
    else Lua returns -1 (Out of stock)
        RD-->>FS: ❌ Sold out
        FS-->>FE: 400 "Out of stock — sold out!"
        FE->>U: Show "SOLD OUT" badge
    else Lua returns -2 (User limit exceeded)
        RD-->>FS: ⚠️ Limit hit
        FS-->>FE: 400 "Purchase limit exceeded"
        FE->>U: Show "Max N per user" message
    end
```

---

## Diagram 3: Unified Screen Flow

```mermaid
flowchart TD
    subgraph Auth["🔐 Auth (No Layout)"]
        LOGIN["/login<br/>LoginPage"]
        SIGNUP["/signup<br/>SignupPage"]
        FORGOT["/forgot-password<br/>ForgotPasswordPage"]
        RESET["/reset-password/:userId/:token<br/>ResetPasswordPage"]
        OTP["/verify-otp<br/>OtpVerificationPage"]
    end

    subgraph Main["🏠 Main App (RootLayout: Navbar + Footer)"]
        HOME["/  (index)<br/>HomePage"]
        
        subgraph FlashSale["⚡ Flash Sale Zone"]
            FS_WIDGET["FlashSaleWidget<br/>(embedded in HomePage)"]
            FS_DETAIL["/flash-sale/:sessionId<br/>FlashSaleDetailPage"]
        end

        subgraph Products["🛍️ Products"]
            PDP["/product-details/:id<br/>ProductDetailsPage"]
        end

        subgraph GroupBuy["👥 Group Buy"]
            GB_LIST["/group-buy<br/>GroupBuyListPage"]
            GB_DETAIL["/group-buy/:campaignId<br/>GroupBuyCampaignPage"]
            GB_JOIN["/group-buy/join/:inviteCode<br/>GroupBuyJoinPage"]
        end

        subgraph Cart["🛒 Cart & Checkout"]
            CART["/cart<br/>CartPage"]
            CHECKOUT["/checkout<br/>CheckoutPage"]
        end

        subgraph Payment["💳 Payment"]
            PAY_SUCCESS["/payment/success<br/>PaymentSuccessPage"]
            PAY_CANCEL["/payment/cancel<br/>PaymentCancelPage"]
        end

        subgraph Orders["📋 Orders"]
            ORDER_SUCCESS["/order-success/:orderNo<br/>OrderSuccessPage"]
            USER_ORDERS["/orders<br/>UserOrdersPage"]
        end

        subgraph User["👤 User"]
            PROFILE["/profile<br/>UserProfilePage"]
            WISHLIST["/wishlist<br/>WishlistPage"]
        end

        subgraph Admin["🔧 Admin"]
            ADMIN_DASH["/admin/dashboard"]
            ADMIN_ADD["/admin/add-product"]
            ADMIN_UPDATE["/admin/product-update/:id"]
            ADMIN_ORDERS["/admin/orders"]
        end
    end

    LOGIN -->|Success| HOME
    SIGNUP -->|Success| HOME
    HOME --> FS_WIDGET
    FS_WIDGET -->|"Click deal"| FS_DETAIL
    FS_DETAIL -->|"Buy Now"| CHECKOUT
    HOME -->|"Click product"| PDP
    PDP -->|"Add to Cart"| CART
    PDP -->|"Start Group Buy"| GB_DETAIL
    HOME -->|"Group Buy tab"| GB_LIST
    GB_LIST -->|"View campaign"| GB_DETAIL
    GB_DETAIL -->|"Share link"| GB_JOIN
    GB_JOIN -->|"Join success"| CHECKOUT
    CART --> CHECKOUT
    CHECKOUT -->|"PayOS redirect"| PAY_SUCCESS
    CHECKOUT -->|"PayOS cancel"| PAY_CANCEL
    PAY_SUCCESS --> USER_ORDERS
    
    style FlashSale fill:#7C3AED22,stroke:#7C3AED
    style GroupBuy fill:#F9731622,stroke:#F97316
    style Auth fill:#1a1a2e22,stroke:#1a1a2e
    style Payment fill:#10B98122,stroke:#10B981
```

---

## Service Communication Map

```mermaid
graph LR
    subgraph Frontend
        FE["React.Client<br/>(Vite + React 19)"]
    end

    subgraph Gateway
        GW["Ocelot API Gateway<br/>:5000"]
    end

    subgraph Services
        ID["Identity.API<br/>JWT + Roles"]
        PROD["Product.API<br/>Catalog CRUD"]
        BASKET["Basket.API<br/>Redis Cart"]
        ORDER["Ordering.API<br/>CQRS + MediatR"]
        PAY["Payment.API<br/>PayOS"]
        INV["Inventory.Product.API<br/>Stock Ledger + gRPC"]
        FS["FlashSale.API<br/>Redis Stock"]
        GB["GroupBuy.API<br/>Social Commerce"]
        CUST["Customer.API<br/>Profile"]
        HF["Hangfire.API<br/>Background Jobs"]
    end

    subgraph Infra
        PG[(PostgreSQL)]
        RD[(Redis)]
        RMQ[(RabbitMQ)]
        ES[(Elasticsearch)]
    end

    FE -->|HTTP| GW
    GW --> ID & PROD & BASKET & ORDER & PAY & INV & FS & GB & CUST

    BASKET -->|gRPC| INV
    BASKET -->|RabbitMQ| ORDER
    PAY -->|RabbitMQ| ORDER

    ID & PROD & ORDER & PAY & FS & GB & CUST --> PG
    BASKET & FS --> RD
    BASKET & ORDER & PAY -.->|MassTransit| RMQ
    ID & ORDER & FS & GB -.->|Serilog| ES

    style FE fill:#7C3AED,color:#fff
    style GW fill:#F97316,color:#fff
    style RD fill:#DC2626,color:#fff
    style PG fill:#336791,color:#fff
    style RMQ fill:#FF6600,color:#fff
```

---

## Key Architectural Notes

### What Makes Nexus Different from Standard E-Commerce

| Feature | Standard | Nexus |
|---------|----------|-------|
| **Flash Sales** | Static discount pages | Redis-backed atomic stock with Lua scripts, per-user limits, client-side countdown |
| **Group Buying** | N/A | Session-based social commerce with invite codes, auto-success threshold, deadline expiry |
| **Stock Management** | Single DB check | Dual: PostgreSQL ledger (Inventory) + Redis counters (FlashSale) |
| **Payment** | Stripe/PayPal | PayOS (Vietnamese market), webhook-driven status |
| **Auth** | Session/Cookie | JWT with role claims, refresh tokens, email confirmation |
| **Inter-service** | Monolith | RabbitMQ events (BasketCheckout → Order), gRPC (Basket → Inventory stock check) |
| **Architecture** | MVC | CQRS (Ordering), Event-Driven, separated read/write paths |

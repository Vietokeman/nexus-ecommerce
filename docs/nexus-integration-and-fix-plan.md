# Nexus Integration and Fix Plan

## 0. Muc tieu va gioi han pham vi

Tai lieu nay chi la ke hoach phan tich de thi cong cac van de con ton dong trong Nexus:
- Fix Appsettings theo huong chuan hoa tu cau hinh Trippio (giu tinh hoa, bo phan mobile).
- Fix React UI inputs, password toggle, toast workflow.
- Fix Angular routing/link issue.
- Audit data toan bo he thong va mo rong SQL scripts cho cac bang con thieu du lieu.

Rang buoc thuc thi:
- Chua code trong tai lieu nay.
- Chua sua file cau hinh va source code.
- Chua commit.
- Chi xuat ke hoach de cho lenh thi cong tiep theo.

Nguyen tac bat buoc:
- Tuan thu 4 bo skill: taste, soft, redesign, output.
- Giu huong kien truc hien co (.NET 8 microservices, Ocelot, Docker Compose, React, Angular).
- Tuyet doi khong hardcode secrets khi thi cong that; phai day qua environment variables.

---

## 1. Ke hoach tich hop Appsettings (loc tu Trippio va lam sach)

## 1.1 Thuc trang hien tai cua Nexus

- Identity.API da co: ConnectionStrings, JwtSettings, SmtpSettings, OAuthSettings (Google/GitHub), FrontendUrl.
- Payment.API da co: ConnectionStrings, PayOS, Smtp.
- Hangfire.API da co: ConnectionStrings, SmtpSettings, GatewayUrl.
- Ordering.API da co EmailSettings.
- Admin.API rat toi gian (thieu ConnectionStrings/Jwt/Smtp/cau hinh media).
- Chua co module storage dang supabase-s3/s3 trong appsettings cua cac service.

Van de can xu ly:
- Co cau hinh mobile URLs trong Payment.API (MobileReturnUrl/MobileCancelUrl) can bo.
- Co nhieu secret dang de text thang trong appsettings.
- Dat ten section chua dong bo (SmtpSettings, Smtp, EmailSettings).

## 1.2 Mapping service -> cau hinh can nhan

1. Identity.API
- Nhan: Jwt, Authentication.Google, Smtp, Serilog, FrontendUrl.
- Muc dich: auth, oauth callback, forgot/reset password email.

2. Payment.API
- Nhan: PayOS, Smtp, Serilog, webhook constraints.
- Muc dich: tao payment link, callback, email bien dong giao dich.

3. Hangfire.API
- Nhan: Smtp, Serilog, GatewayUrl, HangfireConnection.
- Muc dich: gui email retry, background jobs, event notifications.

4. Ordering.API
- Nhan: Smtp (chuan hoa ten section), Serilog.
- Muc dich: order confirmation + status email.

5. OcelotApiGw
- Nhan: Serilog + policy gateway logging.
- Muc dich: trace route mismatch, quick debugging link issues.

6. Admin.API
- Nhan: JwtSettings (neu bao ve API media), MediaStorage settings (local/supabase-s3), Serilog.
- Muc dich: upload media va quan tri noi dung.

7. Seller.API va Product.API (de phong mo rong upload hinh)
- Nhan: MediaStorage settings (supabase-s3) + Serilog.
- Muc dich: doi architecture tu image url manual sang luu media service.

## 1.3 JSON nhap theo huong da lam sach (bo mobile, doi URL ve web)

Luu y:
- Tat ca gia tri nhay cam dung ENV placeholders.
- Bo hoan toan trippio:// va exp://.
- Web callback su dung localhost:3000 (React client).

### Identity.API de xuat

~~~json
{
  "ConnectionStrings": {
    "DefaultConnectionString": "Host=${DB_HOST};Port=${DB_PORT};Database=IdentityDb;Username=${DB_USER};Password=${DB_PASS}"
  },
  "JwtSettings": {
    "Secret": "${IDENTITY_JWT_SECRET}",
    "Issuer": "nexus-ecommerce-platform",
    "Audience": "nexus-ecommerce-client",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "Authentication": {
    "Google": {
      "ClientId": "${GOOGLE_CLIENT_ID}",
      "ClientSecret": "${GOOGLE_CLIENT_SECRET}"
    }
  },
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "UserName": "${SMTP_USERNAME}",
    "Password": "${SMTP_PASSWORD}",
    "DisplayName": "Nexus E-Commerce"
  },
  "FrontendUrl": "http://localhost:3000",
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
~~~

### Payment.API de xuat (loc tu Trippio PayOS + Nexus)

~~~json
{
  "ConnectionStrings": {
    "DefaultConnectionString": "Host=${DB_HOST};Port=${DB_PORT};Database=PaymentDb;Username=${DB_USER};Password=${DB_PASS}"
  },
  "PayOS": {
    "ClientId": "${PAYOS_CLIENT_ID}",
    "ApiKey": "${PAYOS_API_KEY}",
    "ChecksumKey": "${PAYOS_CHECKSUM_KEY}",
    "WebReturnUrl": "http://localhost:3000/payment/success",
    "WebCancelUrl": "http://localhost:3000/payment/cancel",
    "WebhookUrl": "http://localhost:5000/api/payment/payos-callback"
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "${SMTP_USERNAME}",
    "Pass": "${SMTP_PASSWORD}",
    "UseSsl": false,
    "UseStartTls": true,
    "FromName": "Nexus E-Commerce",
    "FromEmail": "${SMTP_FROM_EMAIL}"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
~~~

### Hangfire.API de xuat

~~~json
{
  "ConnectionStrings": {
    "HangfireConnection": "Host=${DB_HOST};Port=${DB_PORT};Database=HangfireDb;Username=${DB_USER};Password=${DB_PASS}"
  },
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "UserName": "${SMTP_USERNAME}",
    "Password": "${SMTP_PASSWORD}",
    "DisplayName": "Nexus E-Commerce"
  },
  "GatewayUrl": "http://ocelot.apigw:80",
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
~~~

### Storage settings de xuat (Supabase S3 mode)

Ap dung cho Admin.API truoc (do dang co upload endpoint), sau do mo rong Seller/Product neu can.

~~~json
{
  "MediaStorage": {
    "Provider": "SupabaseS3",
    "Bucket": "nexus-media",
    "PublicBaseUrl": "${SUPABASE_PUBLIC_URL}",
    "S3": {
      "ServiceUrl": "${SUPABASE_S3_ENDPOINT}",
      "AccessKey": "${SUPABASE_S3_ACCESS_KEY}",
      "SecretKey": "${SUPABASE_S3_SECRET_KEY}",
      "Region": "ap-southeast-1",
      "ForcePathStyle": true
    },
    "LocalFallback": {
      "RootFolder": "wwwroot/images"
    }
  }
}
~~~

Ghi chu:
- Neu chua kich hoat upload cloud, Provider dat Local, giu schema nay de chuyen doi khong vo API.
- Ban se cap nhat tiep gia tri storage khi xac nhan luong upload anh.

---

## 2. Phan tich loi React UI va huong sua

## 2.1 Van de Input to, tho, thieu icon mat cho password

Dau hieu hien tai:
- PremiumInput dang co minHeight 52 + padding doc 14/14, box-shadow dam, nen cam giac input bi qua to.
- Login/Signup/Reset/Forgot dung PremiumInput voi type password nhung khong co toggle show/hide.

Nguyen nhan goc:
1. Primitive input duoc dung toan app, nhung style hien tai thien ve form desktop lon.
2. Chua co primitive rieng cho password (dang lap lai theo page).
3. Chua chuan hoa compact density cho auth forms.

Huong sua de xuat:
1. Tinh chinh PremiumInput
- Tao props density: compact | normal.
- Compact cho auth: minHeight 42-44, input padding 10-11.
- Giam shadow, uu tien border tinh + focus ring mem.

2. Tao PremiumPasswordInput
- Props giong PremiumInput.
- Them end adornment icon Visibility/VisibilityOff.
- Ho tro keyboard accessibility, aria-label, tab focus.
- Password pages dung component nay, khong duoc de raw type=password.

3. Chuan hoa helper + error text
- Error text doi mau do on dinh, line-height nho, spacing gap-1.
- Khong de jump layout khi hien error (reserve helper space nho).

## 2.2 Van de Toastify chua chuyen nghiep

Dau hieu hien tai:
- Dang custom toastStyle inline trong providers.
- Chua co taxonomy thong bao (success/error/info/warning) theo ngu canh domain.
- Chua co dedupe va idempotent toast cho loi lap lai.

Huong sua de xuat:
1. Tao module toast trung tam
- useAppToast hook hoac toast service wrapper:
  - toast.successAction(message)
  - toast.errorAction(message, detail?)
  - toast.networkError(message)
- Tu dong map icon + mau + timeout theo severity.

2. Theme hoa ToastContainer theo premium soft/glass
- Glass background vua phai, border 1px, shadow mem co hue neutral.
- Typography nho hon, spacing gon, progress bar dong bo tone.

3. Logic chong spam
- Them toastId theo operation key.
- neu da co toast cung key trong 2-3s thi khong render tiep.

4. Error mapping
- Map API status 400/401/403/500 thanh thong diep ro rang theo domain.
- Tach thong diep cho validation va network timeout.

---

## 3. Phan tich loi Angular client khong tim thay link

## 3.1 Gia thuyet nguyen nhan (uu tien cao -> thap)

1. LocationStrategy dang su dung HashLocationStrategy
- App module dang force Hash strategy.
- Neu nguoi dung hoac menu dieu huong kieu path thuong, de gap mismatch URL behavior.

2. Base href dang la ./ thay vi /
- Trong index.html dang set base href ./.
- Khi deploy o nested path hoac refresh, asset/router co the resolve sai.

3. Environment prod dang tro API_URL ngoai he thong local
- environment.prod.ts dang tro den https://api.tedu.work.
- Neu deploy local stack Nexus thi API co the khong dung host gateway.

4. Ocelot route/host khong dong bo environment runtime
- Dev route ocelot.Development dung localhost ports.
- Docker runtime route ocelot.json dung service names.
- Sai file ocelot load theo ENV co the dan den 404 API, user nham la loi route frontend.

5. Nginx SPA fallback co, nhung conflict voi hash/path mode
- Nginx try_files da dung cho path strategy.
- Neu app dung hash strategy, fallback van duoc nhung routing convention bi chia doi.

## 3.2 Ke hoach khac phuc de xuat

Phuong an A (khuyen nghi): Chuan hoa Path strategy
1. Bo HashLocationStrategy, dung PathLocationStrategy mac dinh.
2. Doi base href thanh /.
3. Giu nginx try_files /index.html.
4. Verify routerLink toan app theo duong dan path.

Phuong an B (giu Hash strategy)
1. Giu HashLocationStrategy.
2. Dam bao toan bo dieu huong dung #/.
3. Tranh deep-link kieu path o external links/menu.

Quyet dinh thi cong:
- Uu tien A de URL sach va de debug.
- Chi chon B neu co rang buoc deploy cu khong doi duoc.

Checklist test sau khi fix:
1. Mo truc tiep /dashboard, /system/users, /content/posts.
2. Refresh browser tai nested route.
3. Deep-link copy/paste vao tab moi.
4. Build production + run container Nginx.
5. Xac minh API calls dung gateway mong doi.

---

## 4. Ke hoach Data Audit toan he thong va bo sung SQL

## 4.1 Muc tieu audit

- Xac dinh bang nao rong hoac khong dat row-count muc tieu demo.
- Khoa du lieu tham chieu xuyen service (itemNo, userName, orderNo).
- Tao bo SQL bo sung cho bang chua du data, khong de UI bi empty state ngoai y muon.

## 4.2 Danh sach bang can uu tien kiem tra theo service

1. IdentityDb
- AspNetRoles, Users, AspNetUserRoles, Permissions, AspNetUserClaims, AspNetRoleClaims.

2. CustomerDb
- Customers.

3. ProductDb
- CatalogProducts.

4. SellerDb
- SellerProducts, ProductReviews.

5. InventoryDb
- Warehouses, WarehouseStocks, InventoryEntries.

6. OrderDb
- Orders.

7. PaymentDb
- PaymentTransactions.

8. FlashSaleDb
- FlashSaleSessions, FlashSaleItems, FlashSaleOrders.

9. GroupBuyDb
- GroupBuyCampaigns, GroupBuySessions, GroupBuyParticipants.

10. HangfireDb
- Hangfire job tables (set toi thieu cho monitoring job lifecycle).

Khong thuoc SQL phase:
- Admin.API (in-memory store).
- Basket.API (Redis cache, khong table SQL).

## 4.3 Tieu chi xac dinh "thieu data"

1. Bang business chinh co 0 rows.
2. Bang co rows nhung khong du de test state da dang:
- Khong co status variants.
- Khong co du lieu giua cac ngay.
- Khong co du lieu edge cases (cancel/refund/failed/sold-out).

3. Bang con phu thuoc co du lieu nhung bang cha rong (FK graph loi).
4. UI route lien quan dang phai dung fallback text vi data khong ton tai.

## 4.4 SQL audit script de xuat

Tao script audit tong hop, vi du:
- scripts/sql/audit-row-counts.sql
- scripts/sql/audit-cross-service-consistency.sql

Noi dung gom:
1. Count rows tung bang trong 9 DB SQL.
2. Check orphan references:
- PaymentTransactions.OrderNo khong match Orders.
- WarehouseStocks.ItemNo khong co trong CatalogProducts.
- GroupBuy/FlashSale ProductNo khong co trong CatalogProducts.

3. In report PASS/WARN/FAIL theo threshold.

## 4.5 Ke hoach bo sung SQL theo batch

Batch A: High-priority completion
- Bo sung data con thieu cho OrderDb, PaymentDb, ProductReviews.
- Tao da dang status cho order/payment/campaign.

Batch B: Behavioral richness
- Them sold-out scenarios cho flash sale.
- Them group buy near-success/failed/refund.
- Them reviews phan bo 1-5 sao de phuc vu analytics.

Batch C: Operational support
- Seed Hangfire minimal jobs (neu can monitor dashboard).
- Bo sung data audit logs phuc vu admin view (neu doi sang SQL sau nay).

---

## 5. Lo trinh thi cong sau khi duoc phep (Phase 1-4)

## Phase 1: Ap dung cau hinh Appsettings

Deliverables:
1. Chuan hoa appsettings cho Identity.API, Payment.API, Hangfire.API, Ordering.API, Admin.API, OcelotApiGw.
2. Bo mobile callbacks khoi Payment.API.
3. Bo sung section MediaStorage (supabase-s3 ready) cho service co upload.
4. Chuyen secrets sang environment variables trong compose/secret manager.

Validation:
1. Cac service start khong crash vi missing key.
2. OAuth/SMTP/PayOS binding pass.
3. Health checks pass.

Commit du kien:
- feat(config): integrate cleaned smtp payos jwt google and storage settings

## Phase 2: Fix UI React

Deliverables:
1. PremiumInput compact + PremiumPasswordInput show/hide.
2. Auth pages dung password toggle (login/signup/reset).
3. Toast wrapper premium + severity mapping + dedupe.

Validation:
1. Input height dong deu, khong tho kech.
2. Password toggle dung va accessible.
3. Toast khong spam, visual nhat quan.

Commit du kien:
- feat(react-ui): refine inputs password toggle and premium toast workflow

## Phase 3: Fix Angular Routing va gateway alignment

Deliverables:
1. Chot strategy (uu tien Path strategy).
2. Dieu chinh base href, app module strategy, env API URL policy.
3. Verify Nginx + Ocelot routing matrix theo dev/prod.

Validation:
1. Direct link + refresh nested route khong 404.
2. Menu dieu huong stable.
3. API calls dung gateway.

Commit du kien:
- fix(angular-routing): resolve deep link base href and gateway alignment

## Phase 4: Bo sung SQL data scripts cho bang con thieu

Deliverables:
1. Audit scripts + report row counts.
2. SQL bo sung du lieu theo batch A/B/C.
3. Cap nhat init script de chay full seed + audit.

Validation:
1. UI React + Angular co du data de test all states.
2. Khong co orphan references nghiem trong.
3. Script re-run deterministic.

Commit du kien:
- feat(data): expand seed coverage and add cross-service audit scripts

---

## 6. Risk register va bien phap

1. Risk: Lo thong tin nhay cam tu appsettings
- Mitigation: thay toan bo bang ENV placeholders ngay trong Phase 1.

2. Risk: Routing fix gay vo links cu
- Mitigation: test matrix cho deep-link, refresh, bookmark, menu navigation.

3. Risk: SQL bo sung lam sai tham chieu xuyen service
- Mitigation: bat buoc chay audit-cross-service-consistency truoc khi ket luan.

4. Risk: Toast/UI changes gay khac biet cam nhan qua lon
- Mitigation: rollout theo primitive + auth pages truoc, sau do mo rong.

5. Risk: Supabase S3 chua san sang
- Mitigation: thiet ke config dual-mode Provider (Local va SupabaseS3), co fallback local.

---

## 7. Ket luan

Ke hoach nay tao khung thi cong an toan va co thu tu uu tien ro rang:
- Chuan cau hinh truoc (Phase 1),
- On dinh UX core truoc (Phase 2),
- Xu ly routing/gateway de app truy cap ben vung (Phase 3),
- Hoan tat data realism cho he thong (Phase 4).

San sang cho lenh tiep theo: “Ke hoach tot, hay thi cong Phase 1”.

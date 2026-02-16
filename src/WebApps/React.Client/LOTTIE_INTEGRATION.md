# Nexus Commerce - Lottie Animation Integration

## 📥 Files Đã Copy

### 1. Lottie Animation

```
src/assets/animations/ecommerceOutlook.json
```

File animation này được sử dụng cho trang login (left panel).

### 2. CSS Configuration

```
src/styles/index.css
```

Đã cập nhật với:

- ✅ MERN Shop color scheme (Black #000, Red #DB4444)
- ✅ E-commerce gradient (rainbow gradient từ Lottie animation)
- ✅ Font Poppins
- ✅ Auth panel styles cho Lottie background
- ✅ CSS utilities cho gradient text

## 🎨 Sử Dụng Lottie Animation

### Installation

Package `lottie-react` đã có sẵn trong dependencies.

### Usage Example - Login Page

```tsx
import Lottie from 'lottie-react';
import ecommerceAnimation from '@/assets/animations/ecommerceOutlook.json';

export const LoginPage = () => {
  return (
    <div className="flex h-screen">
      {/* Left Panel - Lottie Animation */}
      <div className="nx-auth-panel flex-1 hidden lg:flex">
        <div className="nx-lottie-container">
          <Lottie animationData={ecommerceAnimation} loop={true} autoplay={true} />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center">{/* Your login form here */}</div>
    </div>
  );
};
```

## 🎨 CSS Classes

### Auth Panel

```css
.nx-auth-panel {
  background: var(--nx-black);
  /* Gradient radial overlays for depth */
}
```

### Lottie Container

```css
.nx-lottie-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### Gradient Text

```css
.nx-gradient-ecommerce-text {
  /* Rainbow gradient từ animation */
  background: var(--nx-gradient-ecommerce);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 🎨 Color Tokens

### MERN Shop Colors

```css
--nx-black: #000000; /* Primary color */
--nx-white: #ffffff; /* Text on black */
--nx-red: #db4444; /* Accent/CTA color */
--nx-gray-dark: #191919; /* Secondary dark */
```

### E-commerce Gradient

```css
--nx-gradient-ecommerce: linear-gradient(
  90deg,
  #ffbd00 0%,
  /* Yellow */ #ff5e38 24%,
  /* Orange */ #ff006f 33%,
  /* Pink */ #ca00b7 50%,
  /* Magenta */ #9600ff 67%,
  /* Purple */ #4b4bff 83%,
  /* Blue */ #0096ff 100% /* Light Blue */
);
```

## 📱 Responsive Design

Animation chỉ hiển thị trên màn hình lớn (lg breakpoint):

```tsx
<div className="hidden lg:flex">
  <Lottie animationData={ecommerceAnimation} />
</div>
```

## 🎯 Use Cases

1. **Login/Register Pages** - Left panel background
2. **Loading States** - Center screen
3. **Empty States** - No results, empty cart
4. **Success Animations** - Order placed, payment success

## 📝 Notes

- Animation tự động loop
- File size: ~150KB (đã được optimize)
- Tương thích với Tailwind CSS utility classes
- Responsive và performant

---

**Design inspiration: MERN E-commerce Shop**

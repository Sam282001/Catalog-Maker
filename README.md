# 📖 Catalog Maker

A full-stack web application that helps small business owners and individuals effortlessly manage product inventory and generate professional PDF catalogs on the fly.

This application provides a secure, user-specific environment where all product data is kept private. From adding new items with images to viewing inventory analytics, Catalog Maker is a complete solution built with a modern, performant, and scalable tech stack.

---

## ✨ Features

- 🔐 **Secure Authentication**  
  Full email/password authentication including signup, login, and password recovery flow powered by **Appwrite**.

- 📦 **Full Product Management (CRUD)**  
  Comprehensive interface to create, read, update, and delete products.

- 🖼️ **Cloudinary Image Hosting**  
  Efficiently handles product image uploads through **Cloudinary**, leveraging its CDN and saving backend storage.

- 🏷️ **Dynamic Category Management**  
  Create, manage, and delete product categories on the fly.

- 📄 **Custom PDF Catalog Generation**  
  Instantly generate a downloadable PDF catalog—complete with product images and details—using **jspdf**.

- 📊 **Analytics Dashboard**  
  Key inventory stats (total products, total value, etc.) plus a chart showing product distribution per category.

- 📱 **Modern & Responsive UI**  
  Sleek dark theme and fully responsive interface built with **Tailwind CSS** and custom animated components.

- 🔍 **Advanced Search & Filtering**  
  Debounced search, category filtering, and multiple sorting options for a fast, efficient experience.

---

## 🛠️ Tech Stack

| Tech                | Usage                                             |
| ------------------- | ------------------------------------------------- |
| **Vite**            | Next-generation build tool for fast development   |
| **React**           | Core UI library for the SPA                        |
| **Appwrite**        | Authentication & database management               |
| **Cloudinary**      | Image hosting & delivery via CDN                   |
| **Tailwind CSS**    | Utility-first CSS framework                        |
| **Flowbite React**  | UI components (modals, tables, etc.)               |
| **jspdf / autotable** | Client-side PDF generation                       |
| **react-chartjs-2** | Analytics chart rendering                          |

---

## 📂 Features by Page

### ✅ Authentication
- Custom-styled forms with client-side validation  
- Secure password recovery flow  
- Show/hide password toggle for better UX  

### ✅ Home
- Dynamic 3D rotating carousel with random product images  
- Dashboard cards with custom animated hover effect  

### ✅ Add Product
- Comprehensive form to add products  
- Direct image upload to **Cloudinary**  
- Dynamic category creation/management via modal  

### ✅ Manage Products
- Responsive card-based grid layout  
- Debounced search, category filter, and sorting options  
- Pagination for large product sets  
- Edit/Delete via dropdown on each card  
- Lightbox pop-up for larger image view  

### ✅ Create Catalog
- Table view with search & filter  
- Multi-select / “Select All” checkboxes  
- One-click PDF generation & download  

### ✅ Dashboard
- Stat cards: Total Products, Total Categories, Inventory Value  
- Doughnut chart visualizing product distribution  

---

## 📦 Backend Services

### Appwrite
| Service          | Description                                                                       |
| ---------------- | --------------------------------------------------------------------------------- |
| 🔐 **Authentication** | Secure email/password signup and login                                       |
| 🗃️ **Database**       | Manages products and categories; user-specific with strict security rules     |

### Cloudinary
| Service       | Description                                                                      |
| ------------- | -------------------------------------------------------------------------------- |
| 🖼️ **Storage & Delivery** | Direct client uploads using unsigned preset; fast CDN image delivery   |

---

## 🎥 Live Demo
👉 [**View Demo**](https://catalog-maker-eight.vercel.app)

## 🖥️ Portfolio
👉 Explore more projects on my [**Projects Portfolio**](https://sameermaitreportfolio.vercel.app/)

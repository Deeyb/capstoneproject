<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Code Regal</title>
  <link rel="icon" type="image/svg+xml" href="Photos/CodeRegalWB.svg">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Poppins', sans-serif;
    }
  
    html, body {
      min-height: 100vh;
      overflow-x: hidden; /* Prevent horizontal scrolling only */
    }
  
    body {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      color: #333;
    }
  
    header {
      min-height: 75px; 
      height: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      flex-wrap: wrap;
      gap: 10px;
    }
  
    .logo {
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;
    }
  
    .logo img {
      max-height: 70px; 
      height: auto;
      width: auto;
      max-width: 100%;
      display: block;
      margin: 0;
      padding: 0;
    }
  
    .btns {
      display: flex;
      gap: 10px;
    }
  
    .btns a {
      padding: 6px 15px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.9rem;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
    }
  
    .btns .login {
      background-color: white;
      color: #36b24b;
      border: 2px solid #36b24b;
    }
  
    .btns .login:hover {
      background-color: #f8f9fa;
      transform: translateY(-1px);
    }
  
    .btns .signup {
      background-color: #36b24b;
      color: white;
    }
  
    .btns .signup:hover {
      background-color: #2d8f3f;
      transform: translateY(-1px);
    }
  
    .hero {
      flex: 1 1 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 40px;
      gap: 40px;
      min-height: calc(100vh - 140px);
    }

    .hero-text {
      flex: 1;
      max-width: 50%;
    }

    .hero-text h1 {
      font-size: 43px;
      color: #36b24b;
      line-height: 1.2;
      margin-bottom: 15px;
    }

    .hero-text p {
      margin-top: 10px;
      font-size: 16px;
      color: #555;
      line-height: 1.6;
    }

    .hero-img {
      flex: 1;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-img img {
      width: 100%;
      max-width: 480px;
      height: auto;
      object-fit: contain;
    }
  
    footer {
      flex: 0 0 auto;
      background-color: #f1f1f1;
      text-align: center;
      padding: 15px 20px;
      font-size: 0.8rem;
      color: #666;
      word-wrap: break-word;
    }
    
    footer p {
      margin: 0;
      line-height: 1.5;
    }

/* Tablet and smaller desktop */
@media (max-width: 1024px) {
  .hero {
    padding: 30px;
    gap: 30px;
  }

  .hero-text h1 {
    font-size: 36px;
  }

  .hero-img img {
    max-width: 400px;
  }
}

/* Tablet portrait */
@media (max-width: 768px) {
  header {
    padding: 10px 15px;
    flex-direction: row;
    justify-content: space-between;
  }

  .logo img {
    max-height: 45px;
  }

  .btns {
    gap: 8px;
  }

  .btns a {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .hero {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
    gap: 30px;
    min-height: auto;
  }

  .hero-text {
    max-width: 100%;
    order: 1;
  }

  .hero-text h1 {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .hero-text p {
    font-size: 15px;
  }

  .hero-img {
    order: 2;
    width: 100%;
  }

  .hero-img img {
    max-width: 100%;
    width: 90%;
  }

  footer {
    padding: 12px 15px;
    font-size: 0.75rem;
  }
}

/* Mobile landscape and small tablets */
@media (max-width: 640px) {
  .hero-text h1 {
    font-size: 28px;
  }

  .hero-img img {
    width: 85%;
  }
}

/* Mobile portrait */
@media (max-width: 480px) {
  header {
    padding: 10px 12px;
    min-height: 60px;
  }

  .logo img {
    max-height: 50px;
  }

  .btns {
    gap: 6px;
  }

  .btns a {
    padding: 6px 10px;
    font-size: 0.8rem;
    border-radius: 15px;
  }

  .hero {
    padding: 20px 15px;
    gap: 25px;
  }

  .hero-text h1 {
    font-size: 24px;
    line-height: 1.3;
  }

  .hero-text p {
    font-size: 14px;
    margin-top: 8px;
  }

  .hero-img img {
    width: 100%;
    max-width: 100%;
  }

  footer {
    padding: 10px 12px;
    font-size: 0.7rem;
  }

  footer p {
    font-size: 0.7rem;
  }
}

/* Extra small mobile */
@media (max-width: 360px) {
  header {
    padding: 8px 10px;
  }

  .logo img {
    max-height: 45px;
  }

  .btns a {
    padding: 5px 8px;
    font-size: 0.75rem;
  }

  .hero-text h1 {
    font-size: 20px;
  }

  .hero-text p {
    font-size: 13px;
  }

  footer {
    font-size: 0.65rem;
    padding: 8px 10px;
  }
}

/* Landscape orientation for mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .hero {
    flex-direction: row;
    padding: 20px;
    gap: 20px;
    min-height: auto;
  }

  .hero-text {
    max-width: 50%;
  }

  .hero-text h1 {
    font-size: 24px;
  }

  .hero-img {
    max-width: 50%;
  }

  .hero-img img {
    width: 100%;
  }
}
  </style>
</head>

<body>
  <header>
    <div class="logo">
      <img src="Photos/CodeRegalWB.svg" alt="Code Regal Logo">
    </div>
    <div class="btns">
      <a href="login.php" class="login">Log In</a>
      <a href="registration.php" class="signup">Sign Up</a>
    </div>
  </header>

  <section class="hero">
    <div class="hero-text">
      <h1>A Programming Platform for Education in Kolehiyo ng Lungsod ng Dasmariñas</h1>
      <p>Start your Programming 1 journey today — learn, code, and grow with us.</p>
    </div>
    <div class="hero-img">
      <img src="undraw_pair-programming_9jyg.png" alt="Pair Programming Illustration">
    </div>
  </section>

  <footer>
    <p>&copy; 2025 Code Regal. All rights reserved. | Developed for Kolehiyo ng Lungsod ng Dasmariñas</p>
  </footer>
</body>

</html>

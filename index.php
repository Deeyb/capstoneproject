<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Code Regal</title>
  <link rel="icon" type="image/x-icon" href="/xampp/htdocs/test/img/CodeRegal.png">
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Poppins', sans-serif;
    }
  
    html, body {
      height: 100vh;
      overflow-x: hidden;
    }
  
    body {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      color: #333;
    }
  
    header {
      height: 68px; 
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 30px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    .logo {
      display: flex;
      align-items: center;
    }
  
    .logo img {
      max-height: 85px; 
      height: auto;
      width: auto;
    }
  
    .logo span {
      font-weight: bold;
      color: #36b24b;
      margin-left: 15px;
      font-size: 18px;
    }
  
    .btns button {
      padding: 6px 15px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.9rem;
    }
  
    .btns .login {
      background-color: white;
      color: #36b24b;
      border: 2px solid #36b24b;
    }
  
    .btns .signup {
      background-color: #36b24b;
      color: white;
    }
  
    .hero {
      flex: 1 1 auto;
      padding: 40px 0;
    }
  
    .hero-text h1 {
      font-size: 43px;
      color: #36b24b;
    }
  
    .hero-text p {
      margin-top: 10px;
      font-size: 16px;
      color: #555;
    }
  
    .hero-img img {
      width: 100%;
      max-width: 480px;
      height: auto;
    }
  
    footer {
      flex: 0 0 auto;
      background-color: #f1f1f1;
      text-align: center;
      padding: 10px;
      font-size: 0.8rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .hero-text h1 {
        font-size: 32px;
      }
      
      .logo span {
        margin-left: 10px;
      }
    }
  </style>
</head>

<body>
  <header>
    <div class="logo">
      <img src="img/CodeRegal.png">
      <span>Code Regal</span>
    </div>
    <div class="btns">
      <button class="login">Log In</button>
      <button class="signup">Sign Up</button>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6 col-md-12 mb-4 mb-lg-0">
          <div class="hero-text">
            <h1>A Programming Platform for Education in Kolehiyo ng Lungsod ng Dasmariñas</h1>
            <p>Start your Programming 1 journey today — learn, code, and grow with us.</p>
          </div>
        </div>
        <div class="col-lg-6 col-md-12">
          <div class="hero-img text-center">
            <img src="img/logo1.png" class="img-fluid">
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <p>&copy; 2025 Code Regal. All rights reserved. | Developed for Kolehiyo ng Lungsod ng Dasmariñas</p>
  </footer>

  <!-- Bootstrap JS and Popper.js -->
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"></script>
</body>

</html>

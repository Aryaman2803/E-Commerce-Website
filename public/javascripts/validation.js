const navSlide = () => {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links li");

  //Toggle Nav
  burger.addEventListener("click", () => {
    nav.classList.toggle("nav-active");

    //Animate Links
    navLinks.forEach((links, index) => {
      if (links.style.animation) {
        links.style.animation = "";
      } else {
        links.style.animation = `navLinkFade 0.5s ease forwards ${
          index / 7 + 0.7
        }s`;
      }
    });

    //Burger Animation
    burger.classList.toggle("toggle");
  });
};

navSlide();

const closeBtn = () => {
  const btn = document.querySelector("#closeBtn");
  const flashBox = document.querySelector(".flash-body-container");

  if (btn) {
    btn.addEventListener("click", () => {
      if ((flashBox.style.display = "none"))
        flashBox.classList.add("flash-btn-close");
    });
  }
};

closeBtn();

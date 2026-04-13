document.addEventListener("DOMContentLoaded", function () {
const scrollButtons = document.querySelectorAll("[data-scroll]");

scrollButtons.forEach((button) => {
button.addEventListener("click", function () {
const targetSelector = button.getAttribute("data-scroll");
const target = document.querySelector(targetSelector);

```
  if (target) {
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 0;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth"
    });
  }
});
```

});

const cardButtons = document.querySelectorAll(".btn-card");

cardButtons.forEach((button) => {
button.addEventListener("click", function () {
alert("此功能目前為首頁展示版本，後續可再串接實際操作頁面。");
});
});
});


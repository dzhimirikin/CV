document.addEventListener("DOMContentLoaded", () => {

const galleryLinks = document.querySelectorAll("#gallery .gallery a");
let currentIndex = 0;

galleryLinks.forEach((link, index) => {

link.addEventListener("click", e => {

e.preventDefault();
currentIndex = index;

/* удаляем старый lightbox если он есть */

const old = document.querySelector(".lightbox-overlay");
if(old) old.remove();

openLightbox(link.href);

});

});

function openLightbox(src){

const overlay = document.createElement("div");
overlay.className = "lightbox-overlay";

const img = document.createElement("img");
img.className = "lightbox-img";
img.src = src;

const closeBtn = document.createElement("button");
closeBtn.className = "lightbox-close";
closeBtn.textContent = "×";

const prev = document.createElement("button");
prev.className = "lightbox-prev";
prev.textContent = "‹";

const next = document.createElement("button");
next.className = "lightbox-next";
next.textContent = "›";

overlay.append(img, closeBtn, prev, next);
document.body.appendChild(overlay);


/* ---------- перелистывание ---------- */

function showPrev(){
currentIndex = (currentIndex - 1 + galleryLinks.length) % galleryLinks.length;
img.src = galleryLinks[currentIndex].href;
}

function showNext(){
currentIndex = (currentIndex + 1) % galleryLinks.length;
img.src = galleryLinks[currentIndex].href;
}


/* ---------- кнопки ---------- */

prev.onclick = () => {
showPrev();
};

next.onclick = () => {
showNext();
};


/* ---------- клавиатура ---------- */

function handleKey(e){

if(e.key === "ArrowLeft"){
showPrev();
}

else if(e.key === "ArrowRight"){
showNext();
}

else if(e.key === "Escape"){
closeLightbox();
}

}

document.addEventListener("keydown", handleKey);


/* ---------- закрытие ---------- */

function closeLightbox(){

document.removeEventListener("keydown", handleKey);
overlay.remove();

}

closeBtn.onclick = closeLightbox;


/* ---------- клик по фону ---------- */

overlay.addEventListener("click", e => {

if(e.target === overlay){
closeLightbox();
}

});

}

});

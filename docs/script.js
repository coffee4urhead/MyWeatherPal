let cards = document.querySelectorAll('.about');
let hiddenCards = document.querySelectorAll('.hidden-rotator');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  const settingsLink = document.createElement('a');
  settingsLink.textContent = "Go to Accessibility Settings";
  settingsLink.href = "https://scholar.harvard.edu/ccwilcox/blog/how-reduce-motion-various-operating-systems";

  const message = document.createElement('div');
  message.classList.add("message")
  message.textContent = "It seems like you prefer reduced motion. You can adjust this setting in your device's accessibility settings.";
  message.appendChild(settingsLink);

  const secondChild = document.body.children[0];
  document.body.insertBefore(message, secondChild.nextSibling);
  let rotators = document.querySelectorAll('.hidden-rotator');
  rotators.forEach(entry => {
    entry.classList.remove('hidden-rotator');
  })
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('show-rotator');
            }
            else {
                entry.target.classList.remove('show-rotator');
            }
        })
    })
    hiddenCards.forEach(card => observer.observe(card))
}

// let hiddenCardsTwo = document.querySelectorAll('.hidden-translator');
// const observerTwo = new IntersectionObserver((entris) => {
//     entris.forEach(entr => {
//         if(entr.isIntersecting){
//             entr.target.classList.add('show-translator');
//         }
//         else {
//             entr.target.classList.remove('show-translator');
//         }
//     })
// })
// hiddenCardsTwo.forEach(card => observer.observe(card))
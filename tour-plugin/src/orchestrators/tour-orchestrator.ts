import tourConfig from "../orchestrators/tour.config.json";

interface TourConfig {
  positionID: string;
  imageUrl: string;
  title: string;
  content: string;
  previousBtn: Boolean,
  nextBtn: Boolean,
  closeBtn: Boolean
}

const config: TourConfig[] = tourConfig.flatMap(item => item.entries);

const tour = document.createElement("pl-tour") as any;

let currentStep = Number(localStorage.getItem("currentStep")) || 0;

updateTour(currentStep); 
function updateTour(step: number) {
  tour.tour = {
    title: config[step].title,
    content: config[step].content,
    imageUrl: config[step].imageUrl,
    targetId: config[step].positionID,
    previousBtn: config[step].previousBtn,
    nextBtn: config[step].nextBtn,
    closeBtn: config[step].closeBtn
  };

  tour.step = step + 1;
  tour.totalSteps = config.length;
  localStorage.setItem("currentStep", step.toString());
}

tour.addEventListener("next-clicked", () => {
  currentStep = (currentStep + 1) % config.length;
  updateTour(currentStep);
});

tour.addEventListener("previous-clicked", () => {
  currentStep = (currentStep - 1 + config.length) % config.length;
  updateTour(currentStep);
});

document.querySelector("#host")?.appendChild(tour);

setTimeout(async () => {
  await tour.open();
}, 0);

import  "./style.css"

const taskInput = document.querySelector("#taskInput");
const deadlineInput = document.querySelector("#deadlineInput");
const btnAddTask = document.querySelector("#btnAddTask");
const list = document.querySelector(".list");
const btnDelete = document.querySelector(".btn-delete");
const btnCancel = document.querySelector(".btn-cancel");
const confirmDelete = document.querySelector(".confirmDelete");
const errorText = document.querySelector(".error");


function inputsReset() {
  taskInput.value = "";
  deadlineInput.value = "";
}

let arr = [];


function toLocalDatetimeValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
 
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}


deadlineInput.addEventListener("focus", () => {
  deadlineInput.min = toLocalDatetimeValue();
});



function createList(item) {
  const { days, hours, minutes, seconds } = getRemainingTime(item.deadline);
  return `
   <li class="flex justify-between w-full p-4 item-list border-b border-yellow-50 odd:bg-ston-50 even:bg-yellow-100" data-id=${item.id} >
    <div class="flex lg:flex-row flex-col gap-4 ">
      <div class="lg:w-9/12 w-full text-start text-yellow-800 font-medium">${
        item.task
      }</div>
       <div class="lg:w-3/12 w-full flex justify-center items-center">
      <span class="countdown flex gap-1 ">
        <span class="bg-yellow-900  text-yellow-50 px-2 py-1 rounded">${days}d</span>
        <span class="bg-yellow-900  text-yellow-50 px-2 py-1 rounded">${hours}h</span>
        <span class="bg-yellow-900   text-yellow-50 px-2 py-1 rounded">${minutes}m</span>
        <span class="bg-yellow-900  text-red-400 px-2 py-1 rounded">${seconds}s</span>
      </span>
    </div>
    </div>
   
    <button class="delete" data-id=${item.id}>
      <i class="fa-solid fa-trash text-red-400"></i>
    </button>
   </li>`;
}


const saved = localStorage.getItem("myList");
if (saved) {
  arr = JSON.parse(saved);
  arr.forEach((item) => {
    list.insertAdjacentHTML("afterbegin", createList(item));
  });
   renderList();
}
function getRemainingTime(deadline) {
  const total = new Date(deadline).getTime() - new Date().getTime();
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

// افزودن تسک جدید
function addItemToList(e) {
  e.preventDefault();
  
  const newItem = {
    task: taskInput.value,
    deadline: deadlineInput.value,
    id: Math.trunc(Math.random() * (1000 - 1) + 1),
    alerted: false,
  };
  
const now = new Date();
const picked = new Date(deadlineInput.value);

if (picked <= now) {
  errorText.innerHTML = "Date/Time cannot be in the past";
  return;
}

  if (taskInput.value.length <= 3 || !deadlineInput.value) {
    errorText.innerHTML = "*Inputs can not be empty";
  } else {
    arr.push(newItem);
    
    localStorage.setItem("myList", JSON.stringify(arr));
    renderList();
    errorText.innerHTML = "";
    inputsReset();
  }
}

function sortTasksByDeadline() {
  arr.sort((a, b) => {
    
    const dateA = new Date(a.deadline).getTime();
    const dateB = new Date(b.deadline).getTime();
    return dateA - dateB; 
  });
}

function renderList() {
  list.innerHTML = "";
  if (arr.length === 0) {
    list.classList.add("hidden");
    return; 
  } else {
    
    list.classList.remove("hidden");
  }
  sortTasksByDeadline(); 
  arr.forEach((item) => {
    list.insertAdjacentHTML("beforeend", createList(item)); 
   } ) 
}



// حذف آیتم
function removedItem(e) {
  const clicked = e.target.closest(".delete");
  if (!clicked) return;
  confirmDelete.dataset.id = clicked.dataset.id;
  confirmDelete.classList.remove("hidden");
}

function isToDeletingItem() {
  const isToDeleting = Number(confirmDelete.dataset.id);
  arr = arr.filter((a) => a.id !== isToDeleting);
  localStorage.setItem("myList", JSON.stringify(arr));
  renderList();
  confirmDelete.classList.add("hidden");
}



btnAddTask.addEventListener("click", addItemToList);
list.addEventListener("click", removedItem);
btnDelete.addEventListener("click", isToDeletingItem);
btnCancel.addEventListener("click", () => {
  confirmDelete.classList.add("hidden");
});






function checkTimers() {
  for (const item of arr) {
    const remaining = new Date(item.deadline) - Date.now();
    const li = document.querySelector(`.item-list[data-id="${item.id}"]`);
    if (!li) continue;
    const countdownSpan = li.querySelector(".countdown");
    if (!countdownSpan) continue;

    const remainingTime = getRemainingTime(item.deadline);

    if (remainingTime.total <= 0) {
      countdownSpan.innerHTML = `<span class="bg-red-300 text-white px-8 py-1 rounded flex justify-between gap-1  shake-alert duration-400 transition-all">  elapsed!</span>`;
      if (!item.alerted) {
        item.alerted = true;
        localStorage.setItem("myList", JSON.stringify(arr));
      }
      continue;
    }

    const { days, hours, minutes, seconds } = remainingTime;
    const format = (num) => (num < 10 ? `0${num}` : num);

    countdownSpan.innerHTML = `
      <span class="bg-yellow-900 text-yellow-50 px-2 py-1 rounded">${days}d</span>
      <span class="bg-yellow-900 text-yellow-50 px-2 py-1 rounded">${format(
        hours
      )}h</span>
      <span class="bg-yellow-900 text-yellow-50 px-2 py-1 rounded">${format(
        minutes
      )}m</span>
      <span class="bg-yellow-900 text-red-400 px-2 py-1 rounded">${format(
        seconds
      )}s</span>
    `;

    if (remaining <= 60 * 60 * 1000 && remaining > 0) {
      li.classList.add("bg-yellow-50");
    } else {
      li.classList.remove("bg-yellow-50");
    }

    if (remaining > 0 && item.alerted) {
      item.alerted = false;
      localStorage.setItem("myList", JSON.stringify(arr));
      li.classList.remove("bg-red-200");
      const index = arr.findIndex((task) => task.id === item.id);
      if (index !== -1) {
        if (index % 2 === 0) {
          li.classList.add("even:bg-yellow-50");
        } else {
          li.classList.add("odd:bg-white");
        }
      }
    }
  }
}

setInterval(checkTimers, 1000);
checkTimers();

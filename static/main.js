//JavaScriptの変数はcamelCase
//JavaScriptの関数はcamelCase
//shift+alt+F


//01　初期設定・共通変数
let currentFilter = "all";

//02　Todo関連の関数
//タスクの数をカウントし、各ナビゲーションに表示
async function CountTodos() {
    const navs = document.querySelectorAll(".nav-item");

    const response = await fetch("/api/count", {
        method: "GET"
    });
    const countTodos = await response.json();
    navs[0].querySelector(".badge").textContent = countTodos.count_all;
    navs[1].querySelector(".badge").textContent = countTodos.count_completed;
    navs[2].querySelector(".badge").textContent = countTodos.count_not_completed;




};
//各タスクをDBから取得して表示
async function loadTodos(status) {
    const response = await fetch(status === "all" ? `/api/todos/` : `/api/todos/?status=${status}`);//ブラウザ(JavaScript)がサーバー(FastAPI)に /api/todos のデータをください、とHTTPリクエストを送る
    const todos = await response.json();//サーバーから返ってきたJSON形式のデータをJavaScriptで扱えるデータに変換する
    //const todoList = document.querySelector("#todo-list");

    const categoryContainers = {

        "MMC-水島": document.querySelector("#mmc-mizushima-list"),
        "MMC-岡崎": document.querySelector("#mmc-okazaki-list"),
        "MMC-MMTH": document.querySelector("#mmc-mmth-list"),
        "MMC-MMKI": document.querySelector("#mmc-mmki-list"),
        "MMC-MMM": document.querySelector("#mmc-mmm-list"),
        "ISUZU-US": document.querySelector("#isuzu-us-list"),
        "ISUZU-藤沢": document.querySelector("#isuzu-fujisawa-list"),
        "その他": document.querySelector("#others-list")

    };



    //innnerHTMLはhtmlの内容を直接書き換える
    //todoList.innerHTML = "";
    Object.values(categoryContainers).forEach(container => {
        container.innerHTML = "";
    });
    //todosという連続した値を一つずつ取り出して一つをtodoという名前で扱う
    //そしてその処理を=>{}の中で実施
    todos.forEach(todo => {
        let completedClass = "";
        if (todo.completed) {
            completedClass = "completed"
        }

        const todoList = categoryContainers[todo.category];




        todoList.innerHTML += `
            <article class="todo-item ${completedClass}" id="todo-item-${todo.id}" >
            <input class="checkbox" data-todo-id=${todo.id} onchange="checkDone(this)" type="checkbox">
            <h3 class="todo-title">${todo.title}</h3>
            <p>${todo.priority}</p>
            <p>${todo.category}</p>
            <p>${todo.due_date}</p>
            <button onclick="editTodo(${todo.id})">編集</button>
            <button onclick="deleteTodo(${todo.id})">削除</button>
            </article>
            <article class="edit-item" hidden id="todo-edit-item-${todo.id}" >
            <input id="todo-title" class="todo-input" type="text" placeholder="やることを入力してください..." autocomplete="off">
            <select id="todo-priority">
              <option value="low">低</option>
              <option value="medium" selected>中</option>
              <option value="high">高</option>
            </select>
            <select id="todo-category">
              <option value="MMC-水島" selected>MMC-水島</option>
              <option value="MMC-岡崎">MMC-岡崎</option>
              <option value="MMC-MMTH">MMC-MMTH</option>
              <option value="MMC-MMKI">MMC-MMKI</option>
              <option value="MMC-MMM">MMC-MMM</option>
              <option value="ISUZU-US">ISUZU-US</option>
              <option value="ISUZU-藤沢">ISUZU-藤沢</option>
              <option value="その他">その他</option>
            </select>
            <input id="edit-todo-date" class="date-input" type="date" value="2026-10-06">
            <button onclick="updateTodo(${todo.id})">更新</button>
            <button onclick="cancelTodo(${todo.id})">キャンセル</button>
            </article>`;

    });





}
//タスク削除
async function deleteTodo(todoId) {
    const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        alert("削除に失敗しました");
        return;
    }

    loadTodos();
}
//編集したタスクを登録
async function updateTodo(todoId) {
    const editItem = document.querySelector(`#todo-edit-item-${todoId}`);
    const title = editItem.querySelector("#todo-title").value;
    const priority = editItem.querySelector("#todo-priority").value;
    const category = editItem.querySelector("#todo-category").value;
    const dueDate = editItem.querySelector("#edit-todo-date").value;


    const response = await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            priority: priority,
            category: category,
            due_date: dueDate
        })
    });
    loadTodos(currentFilter);





}
//編集のキャンセル
async function cancelTodo(todoId) {
    const editItem = document.querySelector(`#todo-edit-item-${todoId}`);
    const todoItem = document.querySelector(`#todo-item-${todoId}`);
    editItem.hidden = true;
}
//チェックいれてタスクを完了済みにする
async function checkDone(checkbox) {
    if (checkbox.checked) {
        const response = await fetch(`/api/todos/${checkbox.dataset.todoId}`, {
            method: "PATCH"

        })


        await loadTodos(currentFilter)

    }

}
//タスクの編集
async function editTodo(todoId) {
    const editItem = document.querySelector(`#todo-edit-item-${todoId}`);
    const todoItem = document.querySelector(`#todo-item-${todoId}`);


    editItem.hidden = false;

    editItem.querySelector("#todo-title").value = todoItem.querySelector("h3").textContent;
    editItem.querySelector("#todo-priority").value = todoItem.querySelectorAll("p")[0].textContent;
    editItem.querySelector("#todo-category").value = todoItem.querySelectorAll("p")[1].textContent;
    editItem.querySelector("#edit-todo-date").value = todoItem.querySelectorAll("p")[2].textContent;



}


//03　天気関連の関数
//天気情報を取得して表示
async function getWeather(location) {
    const response = await fetch(`/api/get-weather/?location=${location}`, {
        method: "GET"
    });
    const weather = await response.json();
    console.log(weather.data.hourly);
    const weatherIcons = {
        0: ["☀️", "快晴"],
        1: ["🌤️", "おおむね晴れ"],
        2: ["⛅", "一部曇り"],
        3: ["☁️", "曇り"],
        45: ["🌫️", "霧"],
        48: ["🌫️", "霧氷"],
        51: ["🌦️", "弱い霧雨"],
        53: ["🌦️", "霧雨"],
        55: ["🌧️", "強い霧雨"],
        56: ["🌧️", "凍る霧雨"],
        57: ["🌧️", "強い凍る霧雨"],
        61: ["🌧️", "弱い雨"],
        63: ["🌧️", "雨"],
        65: ["🌧️", "強い雨"],
        66: ["🌧️", "凍る雨"],
        67: ["🌧️", "強い凍る雨"],
        71: ["🌨️", "弱い雪"],
        73: ["❄️", "雪"],
        75: ["❄️", "強い雪"],
        77: ["🌨️", "雪粒"],
        80: ["🌦️", "弱いにわか雨"],
        81: ["🌧️", "にわか雨"],
        82: ["⛈️", "強いにわか雨"],
        85: ["🌨️", "弱いにわか雪"],
        86: ["❄️", "強いにわか雪"],
        95: ["⛈️", "雷雨"],
        96: ["⛈️", "雹を伴う雷雨"],
        99: ["⛈️", "強い雹を伴う雷雨"]
    };
    const weatherCard = document.querySelector(".card.weather-card");
    const weatherForecast=weatherCard.querySelectorAll("span");
    weatherForecast[2].textContent=weatherIcons[weather.data.current.weather_code][0];
    weatherForecast[3].textContent=weather.data.current.temperature_2m;
    const weatherHourlyCard = document.querySelector(".weather-hourly-card");
    weatherHourlyCard.innerHTML = "";
    for(let i=0;i<24;i++){
        weatherHourlyCard.innerHTML+=`
        <div class="weather-hourly-card-each">
         <span>${weather.data.hourly.time[i].slice(11, 16)}</span>
         <span>${weatherIcons[weather.data.hourly.weather_code[i]][0]}</span>
         <span>${weather.data.hourly.temperature_2m[i]}</span>
        </div>
        `
    }
    
}


//04　イベント登録
//大崎と平塚の天気をスイッチ(activeクラス付与)
const weatherAreas=document.querySelectorAll(".weather-area");
weatherAreas.forEach(button=>{
    button.addEventListener("click",()=>{
        weatherAreas.forEach(item=>{
            item.classList.remove("active")
        })
        button.classList.add("active")

        getWeather(button.dataset.filter)


    })

})
//新規FormをHttp Postで送る
const todoForm = document.querySelector("#todo-form")
todoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = document.querySelector("#todo-title").value;
    const priority = document.querySelector("#todo-priority").value;
    const category = document.querySelector("#todo-category").value;
    const dueDate = document.querySelector("#todo-date").value;

    await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            priority: priority,
            category: category,
            due_date: dueDate
        })
    });
    todoForm.reset();
    inputDate.value = new Date().toLocaleDateString("sv-SE");

    loadTodos();
}
)

//ナビゲーションのactiveクラス付与
const navItems = document.querySelectorAll(".nav-item")
//どれか押されたら、すべてからactiveクラスを外す。
//押されたボタンのみactiveクラスを付ける。
navItems.forEach(button => {
    button.addEventListener("click", () => {
        navItems.forEach(item => {
            item.classList.remove("active");

        })
        button.classList.add("active");
        const status = button.dataset.filter;
        currentFilter = status;

        loadTodos(currentFilter);

    })
})



//05　初回表示
//初期の日付を今日にする
const inputDate = document.querySelector("#todo-date");
inputDate.value = new Date().toLocaleDateString("sv-SE");

CountTodos()

getWeather("平塚");

loadTodos(currentFilter);



/*
function applyCompletedStyle(){
    const todoItems=document.querySelectorAll(".todo-item");
    console.log("Todo件数:", todoItems.length);
    todoItems.forEach(todo=>{
        todo.classList.add("completed");
        console.log(todo.className);
    });
}
*/


















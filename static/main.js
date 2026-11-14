//JavaScriptの変数はcamelCase
//JavaScriptの関数はcamelCase
//shift+alt+F


//01　初期設定・共通変数
let currentFilter = "active";
let currentProjectId = 1;
const today = new Date().toLocaleDateString("sv-SE");

//02　Todo関連の関数
//タスクの数をカウントし、各ナビゲーションに表示
async function CountTodos() {
    const navs = document.querySelectorAll(".item-state");

    const response = await fetch("/api/count", {
        method: "GET"
    });
    const countTodos = await response.json();
    navs[0].querySelector(".badge").textContent = countTodos.count_not_completed;
    navs[1].querySelector(".badge").textContent = countTodos.count_all;
    navs[2].querySelector(".badge").textContent = countTodos.count_completed;




};
//各タスクをDBから取得して表示
async function loadTodos(status, projectId) {
    const todosResponse = await fetch(status === "all" ? `/api/todos/` : `/api/todos/?status=${status}`);//ブラウザ(JavaScript)がサーバー(FastAPI)に /api/todos のデータをください、とHTTPリクエストを送る
    const todos = await todosResponse.json();//サーバーから返ってきたJSON形式のデータをJavaScriptで扱えるデータに変換する

    const projectsResponse = await fetch("/api/projects/");//ブラウザ(JavaScript)がサーバー(FastAPI)に /api/todos のデータをください、とHTTPリクエストを送る
    const projects = await projectsResponse.json();//サーバーから返ってきたJSON形式のデータをJavaScriptで扱えるデータに変換する
    const casesResponse = await fetch("/api/cases/");//ブラウザ(JavaScript)がサーバー(FastAPI)に /api/todos のデータをください、とHTTPリクエストを送る
    const cases = await casesResponse.json();//サーバーから返ってきたJSON形式のデータをJavaScriptで扱えるデータに変換する


    const projectList = document.querySelector("#project-list");
    projectList.innerHTML = "";


    let caseHTML = "";
    const project = projects.find(projectItem => projectItem.id == projectId);
    console.log(project)
    const projectCases = cases.filter(caseItem => caseItem.project_id == projectId&&caseItem.completed==false);

    projectCases.forEach(caseItem => {
        const caseTodos = todos.filter(todo => todo.case_id == caseItem.id);

        let todoHTML = "";
        caseTodos.forEach(todo => {
            todoHTML += `
                    <article class="todo-item" id="todo-item-${todo.id}">
                        <input type="checkbox" onchange="checkDone(this)" data-todo-id=${todo.id} ${todo.completed ? "checked" : ""}>
                        <span>${todo.title}</span>
                        <p>${todo.priority}</p>
                        <p>${todo.due_date}</p>
                        <button onclick="editTodo(${todo.id})">編集</button>
                        <button onclick="deleteTodo(${todo.id})">削除</button>
                    </article>
                    <article class="todo-edit-item" hidden id="todo-edit-item-${todo.id}" >
                        <input id="edit-todo-title" class="todo-input" type="text" placeholder="やることを入力してください..." autocomplete="off">
                        <select id="edit-todo-priority">
                          <option value="low">低</option>
                          <option value="medium" selected>中</option>
                          <option value="high">高</option>
                        </select>
                        <input id="edit-todo-date" class="date-input" type="date" value=${today}>
                        <button onclick="updateTodo(${todo.id})">更新</button>
                        <button onclick="cancelTodo(${todo.id})">キャンセル</button>
                    </article>
                `
        });

        caseHTML += `
            <section class="case-group">
                <div class="case-top">
                    <h3>${caseItem.name}</h3>

                    <div class="case-menu">
                        <button class="case-menu-trigger" onclick="showCaseDeleteorCompleted(${caseItem.id})">⋮</button>
                        <div class="case-operation-button case-operation-button-${caseItem.id}" hidden>
                          <button class="case-action-complete" onclick="caseCompleted(${caseItem.id})">完了</button>
                          <button class="case-action-delete" onclick="caseDelete(${caseItem.id})">削除</button>
                  
                        </div>
                    </div>

                </div>
                <div class="case-todos">
                   ${todoHTML}
                </div>
            </section>
            <button onclick="showAddTodo(${caseItem.id})">+タスクを追加</button>

            <section class="add-todo-${caseItem.id}" hidden>
              <input id="todo-title" class="todo-title" type="text">
              <select id="todo-priority" class="todo-priority">
               <option value="low">低</option>
               <option value="medium" selected>中</option>
               <option value="high">高</option>
              </select>
              <input id="edit-todo-date" class="todo-date" type="date" value=${today}>
              <button onclick="addTodo(${caseItem.id})">登録</button>
              <button onclick="cancelAddTodo(${caseItem.id})">キャンセル</button>
            </section>
            
            `


    })
    projectList.innerHTML += `
        <section class="project-group">
          <h2>${project.name}</h2>
          ${caseHTML}
          <button onclick="showAddCase(${project.id})">＋案件を追加</button>
          <section class="add-case-${project.id}" hidden>
            <input id="case-name" class="case-name" type="text">
            <textarea class="case-description"></textarea>
            <button onclick="addCase(${project.id})">登録</button>
            <button onclick="cancelCase(${project.id})">キャンセル</button>
          </section>

        </section>`;










    /*
    const projectCategoryContainers = {

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
    Object.values(projectCategoryContainers).forEach(container => {
        container.innerHTML = "";
    });
    //todosという連続した値を一つずつ取り出して一つをtodoという名前で扱う
    //そしてその処理を=>{}の中で実施
    todos.forEach(todo => {
        let completedClass = "";
        if (todo.completed) {
            completedClass = "completed"
        }

        const todoList = projectCategoryContainers[todo.project_name];




        todoList.innerHTML += `
            <article class="todo-item ${completedClass}" id="todo-item-${todo.id}" >
            <input class="checkbox" data-todo-id=${todo.id} onchange="checkDone(this)" type="checkbox">
            <h3 class="todo-title">${todo.title}</h3>
            <p>${todo.priority}</p>
            <p>${todo.project_name}</p>
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
    */





}
//プロジェクト切り替えのタブ生成
async function createProjectTabs() {
    const projectsResponse = await fetch("/api/projects/");
    const projects = await projectsResponse.json();
    const tabs = document.querySelector(".project-switch")
    tabs.innerHTML = "";
    projects.forEach(project => {

        const activeClass = project.id == currentProjectId ? "active" : ""

        tabs.innerHTML += `
        <button class="project-tab ${activeClass}" data-filter=${project.id} onclick="selectProject(${project.id},this)">${project.name}</button>
        
        `
    })

}

/*
const projectTabs = document.querySelectorAll(".project-tab")
projectTabs.forEach(button => {
    button.addEventListener("click", () => {
        projectTabs.forEach(item => {
            item.classList.remove("active")
        })
        button.classList.add("active")
        currentProjectId = button.dataset.filter;

    })
})
*/

//プロジェクトタブ選択したときのfunction
function selectProject(projectId, button) {
    // 選択中のプロジェクトIDを更新
    currentProjectId = projectId;

    // 全タブからactiveを外す
    const projectTabs = document.querySelectorAll(".project-tab");

    projectTabs.forEach(tab => {
        tab.classList.remove("active");
    });

    // 押したタブだけactive
    button.classList.add("active");

    // 押したプロジェクトを表示
    loadTodos(currentFilter, currentProjectId);
}
//CASEの削除と完了のボタンを表示
function showCaseDeleteorCompleted(caseId){
    const caseOperationButton=document.querySelector(`.case-operation-button-${caseId}`)
    caseOperationButton.hidden = !caseOperationButton.hidden;

}
//CASEの完了押したときの処理           
async function caseCompleted(caseId){
    const response=await fetch(`/api/cases/${caseId}/complete`,{
        method:"PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            completed: true,
        })
    })

    await loadTodos(currentFilter, currentProjectId);
    
    
}
//CASEの削除押したときの処理   
async function caseDelete(caseId){
    const responseTodo=await fetch(`/api/cases/${caseId}/todos`,{
        method:"DELETE"
    });
    if (!responseTodo.ok) {
        alert("削除に失敗しました");
        return;
    }
    
    const responseCase=await fetch(`/api/cases/${caseId}`,{
        method:"DELETE"
    });
    if (!responseCase.ok) {
        alert("削除に失敗しました");
        return;
    }

    loadTodos(currentFilter, currentProjectId);

}
//todo削除
async function deleteTodo(todoId) {
    const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        alert("削除に失敗しました");
        return;
    }

    loadTodos(currentFilter, currentProjectId);
}
//編集したtodoを登録
async function updateTodo(todoId) {
    const editItem = document.querySelector(`#todo-edit-item-${todoId}`);
    const title = editItem.querySelector("#edit-todo-title").value;
    const priority = editItem.querySelector("#edit-todo-priority").value;
    const dueDate = editItem.querySelector("#edit-todo-date").value;


    const response = await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            priority: priority,
            due_date: dueDate
        })
    });
    loadTodos(currentFilter, currentProjectId);





}
//todo編集のキャンセル
async function cancelTodo(todoId) {
    const editItem = document.querySelector(`#todo-edit-item-${todoId}`);
    const todoItem = document.querySelector(`#todo-item-${todoId}`);
    editItem.hidden = true;
    todoItem.hidden = false; // 追加：元のTodoを隠す
}
//チェックいれてtodoを完了済みにする
async function checkDone(checkbox) {
    if (checkbox.checked) {
        const response = await fetch(`/api/todos/${checkbox.dataset.todoId}`, {
            method: "PATCH"

        })


        await loadTodos(currentFilter, currentProjectId);

    }

}
//todoの編集
async function editTodo(todoId) {
    const editItem = document.querySelector(`#todo-edit-item-${todoId}`);
    const todoItem = document.querySelector(`#todo-item-${todoId}`);

    editItem.hidden = false;
    todoItem.hidden = true; // 追加：元のTodoを隠す
    console.log("todoId:", todoId);
    console.log("editItem:", editItem);
    console.log("todoItem:", todoItem);

    editItem.querySelector("#edit-todo-title").value = todoItem.querySelector("span").textContent;
    editItem.querySelector("#edit-todo-priority").value = todoItem.querySelectorAll("p")[0].textContent;
    editItem.querySelector("#edit-todo-date").value = todoItem.querySelectorAll("p")[1].textContent;



}
//新規CASE追加のUI表示
function showAddCase(projectId) {
    const addCase = document.querySelector(`.add-case-${projectId}`)
    addCase.hidden = false
}
//新規CASE追加のUI非表示切り替え
function cancelCase(projectId) {
    const addCase = document.querySelector(`.add-case-${projectId}`)
    addCase.hidden = true
}
//新規CASE追加実行
async function addCase(projectId) {
    const editCase = document.querySelector(`.add-case-${projectId}`)
    const name = editCase.querySelector(".case-name").value
    const description = editCase.querySelector(".case-description").value
    const response = await fetch(`/api/cases/?project_id=${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            description: description,
            project_id: projectId
        })



    })
    console.log(response)
    loadTodos(currentFilter, currentProjectId);

}
//新規todo追加のUI表示
function showAddTodo(caseId) {
    const addTodo = document.querySelector(`.add-todo-${caseId}`)
    addTodo.hidden = false
}
//新規todo追加のUI非表示切り替え
function cancelAddTodo(caseId) {
    const addTodo = document.querySelector(`.add-todo-${caseId}`)
    addTodo.hidden = true
}
//新規todo追加実行
async function addTodo(caseId) {
    const editTodo = document.querySelector(`.add-todo-${caseId}`)
    const title = editTodo.querySelector(".todo-title").value
    const priority = editTodo.querySelector(".todo-priority").value
    const dueDate = editTodo.querySelector(".todo-date").value;
    const response = await fetch(`/api/todos/?case_id=${caseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            priority: priority,
            due_date: dueDate,
            case_id: caseId
        })



    })
    console.log(response)
    loadTodos(currentFilter, currentProjectId);

}




//03　天気関連の関数

//天気情報を取得して表示
async function getWeather(location, span) {
    const response = await fetch(`/api/get-weather/?location=${location}&span=${span}`, {
        method: "GET"
    });
    const weather = await response.json();
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
    const weatherCurrentInfo = document.querySelector(".weather-current-info");
    const weatherCurrentInfoSpan = weatherCurrentInfo.querySelectorAll("span");
    weatherCurrentInfoSpan[0].textContent = weatherIcons[weather.data.current.weather_code][0];
    weatherCurrentInfoSpan[1].textContent = weather.data.current.temperature_2m;
    weatherCurrentInfoSpan[2].textContent = weatherIcons[weather.data.current.weather_code][1];
    const weatherHourlyCard = document.querySelector(".weather-hourly-card");
    const weatherWeeklyCard = document.querySelector(".weather-weekly-card");

    if (span == "時間別") {
        weatherHourlyCard.hidden = false;
        weatherWeeklyCard.hidden = true;

        weatherHourlyCard.innerHTML = "";
        for (let i = 0; i < 24; i++) {
            weatherHourlyCard.innerHTML += `
        <div class="weather-hourly-card-each">
         <span>${weather.data.hourly.time[i].slice(11, 16)}</span>
         <span>${weatherIcons[weather.data.hourly.weather_code[i]][0]}</span>
         <span>${weather.data.hourly.temperature_2m[i]}</span>
         <span>${weather.data.hourly.precipitation_probability[i]}%</span>
        </div>
        `
        }


    } else if (span == "週間") {
        weatherHourlyCard.hidden = true;
        weatherWeeklyCard.hidden = false;




        weatherWeeklyCard.innerHTML = "";
        for (let i = 0; i < 7; i++) {
            const date = weather.data.daily.time[i];
            const day = new Date(`${date}T00:00:00`).getDay();

            const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
            weatherWeeklyCard.innerHTML += `
        <div class="weather-weekly-card-each">
         <span class="weekly-day day-${day}">${dayNames[day]}</span>
         <span class="weekly-date">${date.slice(5).replace("-", "/")}</span>
         <span class="weekly-icon">${weatherIcons[weather.data.daily.weather_code[i]][0]}</span>
         <span class="weekly-description">${weatherIcons[weather.data.daily.weather_code[i]][1]}</span>
         
         <span class="weekly-temp-min">${weather.data.daily.temperature_2m_min[i]}°</span>
         <span class="weekly-temp-max">${weather.data.daily.temperature_2m_max[i]}°</span>
         
         <span class="weekly-rain">${weather.data.daily.precipitation_probability_max[i]}%</span>
        </div>
        `
        }


    }


}


//04　イベント登録
//大崎と平塚の天気をスイッチ(activeクラス付与)
const weatherAreas = document.querySelectorAll(".weather-area");
weatherAreas.forEach(button => {
    button.addEventListener("click", () => {
        weatherAreas.forEach(item => {
            item.classList.remove("active")
        })
        button.classList.add("active")

        const activeSpan = document.querySelector(".weather-span.active")
        getWeather(button.dataset.filter, activeSpan.dataset.filter)


    })

})

const weatherSpans = document.querySelectorAll(".weather-span");
weatherSpans.forEach(button => {
    button.addEventListener("click", () => {
        weatherSpans.forEach(item => {
            item.classList.remove("active")
        })
        button.classList.add("active")

        const activeLocation = document.querySelector(".weather-area.active")
        getWeather(activeLocation.dataset.filter, button.dataset.filter)



    })
})

//新規FormをHttp Postで送る
/*
const todoForm = document.querySelector("#todo-form")
todoForm.addEventListener("submit", async (event) => {

    event.preventDefault();//これによりページを再読み込みせずに処理できる、ユーザーが操作している画面を維持したまま、必要なデータだけ更新できるというのがメリット。
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

    loadTodos(currentFilter);
}
)
*/
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


    })
})

//itemstateのactiveクラス付与
const itemState = document.querySelectorAll(".item-state")
console.log(itemState)
itemState.forEach(button => {
    button.addEventListener("click", () => {
        itemState.forEach(item => {
            item.classList.remove("active")
        })
        button.classList.add("active")
        const status = button.dataset.filter;
        currentFilter = status;

        loadTodos(currentFilter, currentProjectId);

    })
})

//05　初回表示
//初期の日付を今日にする
const inputDate = document.querySelector("#todo-date");
//inputDate.value = new Date().toLocaleDateString("sv-SE");



createProjectTabs()
CountTodos()
getWeather("平塚", "時間別");
loadTodos(currentFilter,currentProjectId);























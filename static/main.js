
//JavaScriptの変数はcamelCase
//JavaScriptの関数はcamelCase

async function loadTodos(status) {
    const response = await fetch(status==="all" ? `/api/todos/` : `/api/todos/?status=${status}`);//ブラウザ(JavaScript)がサーバー(FastAPI)に /api/todos のデータをください、とHTTPリクエストを送る
    const todos = await response.json();//サーバーから返ってきたJSON形式のデータをJavaScriptで扱えるデータに変換する
    const todoList = document.querySelector("#todo-list");

    console.log("HTTPステータス:", response.status);
    console.log("取得データ:", todos);
    //innnerHTMLはhtmlの内容を直接書き換える
    todoList.innerHTML = "";
    //todosという連続した値を一つずつ取り出して一つをtodoという名前で扱う
    //そしてその処理を=>{}の中で実施
    todos.forEach(todo => {
        let completedClass="";
        if(todo.completed){
            completedClass="completed"
        }

        todoList.innerHTML +=`
            <article class="todo-item ${completedClass}" id="todo-item-${todo.id}" >
            <input class="checkbox" data-todo-id=${todo.id} onchange="checkDone(this)" type="checkbox">
            <h3>${todo.title}</h3>
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
              <option value="仕事">仕事</option>
              <option value="学習" selected>学習</option>
              <option value="健康">健康</option>
            </select>
            <input id="todo-date" class="date-input" type="date" value="2026-10-06">
            <button onclick="updateTodo(${todo.id})">更新</button>
            <button onclick="cancelTodo(${todo.id})">キャンセル</button>
            </article>`;

    });



    console.log(todos);
    console.log("HTML生成完了");

    
    

}
loadTodos();

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
    loadTodos();
}
)

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

async function editTodo(todoId){
    const editItem=document.querySelector(`#todo-edit-item-${todoId}`);
    const todoItem = document.querySelector(`#todo-item-${todoId}`);
    console.log("編集フォーム:", editItem);
    console.log("Todo:", todoItem);

    editItem.hidden = false;
    
    editItem.querySelector("#todo-title").value=todoItem.querySelector("h3").textContent;
    editItem.querySelector("#todo-priority").value=todoItem.querySelectorAll("p")[0].textContent;
    editItem.querySelector("#todo-category").value=todoItem.querySelectorAll("p")[1].textContent;
    editItem.querySelector("#todo-date").value=todoItem.querySelectorAll("p")[2].textContent;
    
    console.log("編集フォームのhidden:", editItem.hidden);
    console.log("Todoのhidden:", todoItem.hidden);

}

async function updateTodo(todoId){
    const editItem=document.querySelector(`#todo-edit-item-${todoId}`);
    const title=editItem.querySelector("#todo-title").value;
    const priority=editItem.querySelector("#todo-priority").value;
    const category=editItem.querySelector("#todo-category").value;
    const dueDate=editItem.querySelector("#todo-date").value;


    const response=await fetch(`api/todos/${todoId}`,{
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            title:title,
            priority:priority,
            category:category,
            due_date:dueDate
        })
    });
    loadTodos(currentFilter);



    

}


async function cancelTodo(todoId){
    const editItem=document.querySelector(`#todo-edit-item-${todoId}`);
    const todoItem = document.querySelector(`#todo-item-${todoId}`);
    editItem.hidden = true;
}


//どれか押されたら、すべてからactiveクラスを外す。
//押されたボタンのみactiveクラスを付ける。
let currentFilter = "all";
const navItems = document.querySelectorAll(".nav-item")
navItems.forEach(button => {
    button.addEventListener("click", () => {
        navItems.forEach(item => {
            item.classList.remove("active");

        })
        button.classList.add("active");
        const status=button.dataset.filter;
        currentFilter = status;

        loadTodos(currentFilter);

    })
})


async function checkDone(checkbox) {
    if (checkbox.checked) {
        const response = await fetch(`/api/todos/${checkbox.dataset.todoId}`, {
            method: "PATCH"

        })
        console.log("checkされたよ");
        console.log(checkbox.dataset.todoId);
        
        await loadTodos(currentFilter)

    }

}

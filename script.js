const BOOKSHELF = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form-add");
  submitForm.addEventListener("submit", addToBookshelf);
  const searchForm = document.getElementById("form-search");
  searchForm.addEventListener("submit", searchBook);
  document.addEventListener(RENDER_EVENT, renderBookshelf);
  loadDataFromStorage();
});

// MAIN FEATURE
function addToBookshelf(event) {
  event.preventDefault();
  const id = +new Date();
  const title = document.getElementById("input-title").value;
  const author = document.getElementById("input-author").value;
  const year = parseInt(document.getElementById("input-year").value);
  const isComplete = document.getElementById("input-checkbox").checked;
  const bookObj = {
    id,
    title,
    author,
    year,
    isComplete,
  };

  BOOKSHELF.push(bookObj);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
  toast("Buku ditambahkan");
}
function makeBookList(bookshelfObj) {
  const card = document.createElement("div");
  card.id = bookshelfObj.id;
  card.classList.add("card");
  const createTextElement = (tag, text) => {
    const element = document.createElement(tag);
    element.innerText = text;
    return element;
  };
  const textTitle = createTextElement("h4", bookshelfObj.title);
  const textAuthor = createTextElement("p", bookshelfObj.author);
  const textYear = createTextElement("span", bookshelfObj.year);
  card.append(textTitle, textAuthor, textYear);
  const createButton = (text, className, iconData, clickHandler) => {
    const button = document.createElement("button");
    button.classList.add("btn-sm", className);
    button.innerText = text;
    const icon = document.createElement("span");
    icon.classList.add("iconify");
    icon.setAttribute("data-icon", iconData);
    button.append(icon);
    button.addEventListener("click", clickHandler);
    return button;
  };
  let btnAction;
  if (bookshelfObj.isComplete) {
    btnAction = createButton("Undo", "btn-undo", "ci:undo", function () {
      undoBookFromComplete(bookshelfObj.id);
      toast("Buku di dipindah ke daftar BELUM DIBACA");
    });
  } else {
    btnAction = createButton(
      "Sudah dibaca",
      "btn-done",
      "iconify",
      function () {
        addBookToComplete(bookshelfObj.id);
        toast("Buku di dipindah ke daftar SELESAI DIBACA");
      }
    );
  }
  const btnDelete = createButton(
    "",
    "btn-delete",
    "material-symbols:delete-outline",
    function () {
      deleteDialog(bookshelfObj.id);
    }
  );
  const btnGroup = document.createElement("div");
  btnGroup.classList.add("btn-group");
  btnGroup.append(btnAction, btnDelete);
  card.append(btnGroup);
  return card;
}

function renderBookshelf() {
  const unreadBookshelf = document.getElementById("unread-bookshelf");
  const completedBookshelf = document.getElementById("completed-bookshelf");
  const emptyBookshelf =
    "<div class='card empty-bookshelf'><span>Buku belum di tambahkan</span></div>";
  unreadBookshelf.innerHTML = "";
  completedBookshelf.innerHTML = "";
  if (filterIsCompleted()[0] == "complete_empty") {
    completedBookshelf.innerHTML = emptyBookshelf;
  }
  if (filterIsCompleted()[0] == "uncomplete_empty") {
    unreadBookshelf.innerHTML = emptyBookshelf;
  }
  if (filterIsCompleted().length == 2 || !filterIsCompleted()) {
    completedBookshelf.innerHTML = emptyBookshelf;
    unreadBookshelf.innerHTML = emptyBookshelf;
  }
  for (const bookItem of BOOKSHELF) {
    const bookshelfElement = makeBookList(bookItem);
    if (bookItem.isComplete) {
      completedBookshelf.append(bookshelfElement);
    } else if (!bookItem.isComplete) {
      unreadBookshelf.append(bookshelfElement);
    }
  }
}

// SUPPORT FUNCTION
function findBook(bookId) {
  for (const bookItem of BOOKSHELF) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return;
}
function findBookIndex(bookId) {
  for (const index in BOOKSHELF) {
    if (BOOKSHELF[index].id === bookId) {
      return index;
    }
  }
  return -1;
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(BOOKSHELF));
  document.dispatchEvent(new Event("save-to-bookshelf"));
}
function loadDataFromStorage() {
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (data) {
    for (const book of data) {
      BOOKSHELF.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// FEATURE FUNCTION
function addBookToComplete(bookId) {
  const book = findBook(bookId);
  if (!book) return;
  book.isComplete = true;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}
function undoBookFromComplete(bookId) {
  const book = findBook(bookId);
  if (!book) return;
  book.isComplete = false;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}
function removeBookFromBookshelf(bookId) {
  const book = findBookIndex(bookId);
  if (book === -1) return;
  BOOKSHELF.splice(book, 1);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// ADITIONAL FEATURE
function searchBook(e) {
  e.preventDefault();
  let inputSearch = document.getElementById("input-search").value.toLowerCase();
  const books = document.querySelectorAll("#bookshelf-wrapper .card");
  if (inputSearch !== "") {
    books.forEach((item) => {
      if (item.firstChild.textContent.toLowerCase().includes(inputSearch)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }
  if (inputSearch == "") {
    books.forEach((item) => {
      item.style.display = "block";
    });
  }
}
function filterIsCompleted() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  let getIsComplete = [];
  if (data) {
    for (let i = 0; i < data.length; i++) {
      getIsComplete.push(data[i].isComplete);
    }
  }
  let count = {};
  getIsComplete.forEach((isComplete) => {
    count[isComplete] = (count[isComplete] || 0) + 1;
  });
  const result = [];
  if (!count.true) {
    // bookshelf_complete_empty
    result.push("complete_empty");
  }
  if (!count.false) {
    // bookshelf_uncomplete_empty
    result.push("uncomplete_empty");
  }
  return result;
}
function toast(message) {
  const body = document.querySelector("body");
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerText = message;
  body.append(toast);
  setTimeout(function () {
    toast.remove();
  }, 3000);
}
const btnToggleFormAdd = document.getElementById("toggle-form-add");
btnToggleFormAdd.addEventListener("click", function () {
  const formAdd = document.getElementById("bookshelf-form");
  formAdd.classList.toggle("close");
  if (formAdd.className == "bookshelf-form close") {
    btnToggleFormAdd.firstChild.style.transform = "rotate(180deg)";
  } else {
    btnToggleFormAdd.firstChild.style.transform = "rotate(0deg)";
  }
});

function deleteDialog(bookshelfObj) {
  const body = document.getElementById("dialog");
  body.innerHTML = `
  <div id="delete-dialog">
    <div class="card">
        <h4>Yakin untuk menghapus data?</h4>
        <div class="btn-group">
          <button id="d_btn-delete" class="delete">Hapus</button>
          <button id="d_btn-cancel" class="cancel">Batal</button>
        </div>
    </div>
  </div>
  `;
  confirmDialog(bookshelfObj);
}
function confirmDialog(bookshelfObj) {
  const body = document.getElementById("dialog");
  const dialog = document.getElementById("delete-dialog");
  const btnDelete = document.getElementById("d_btn-delete");
  const btnCancel = document.getElementById("d_btn-cancel");
  btnDelete.addEventListener("click", function () {
    removeBookFromBookshelf(bookshelfObj);
    toast("Buku berhasil di hapus");
    body.removeChild(dialog);
  });
  btnCancel.addEventListener("click", function () {
    body.removeChild(dialog);
  });
}

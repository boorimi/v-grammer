$(function () {

  // 비동기 페이징 (archiveupdate.jsp)
  // 추가 : 페이징 후에도 select태그 자동지정 및 토글버튼 구현
  $(document).on("click", ".archive-update-button-1", function () {
     let a_pk = $("input[name='a_pk']").val();
     console.log(a_pk);
     $.ajax({
      url: "ArchiveUpdateC",
      type: "get",
      data: { a_pk },
      dataType: "json",
      success: function(resData) {
        // 요청이 성공했을 때 실행할 코드
        test2(resData);
    },
    error: function(xhr, status, error) {
        // 요청이 실패했을 때 실행할 코드
        console.log("Request failed: " + status + ", " + error);
    }
      
    });
  });

  // 페이지 로드 시 투명도를 올리는 함수 호출
  adjustOpacity2(1);

  //콜라보멤버 div 처리
  let a = $(".collaboMember");
  replaceCollabomemberString(a);

  // select 태그 자동지정 처리
  collabo_yesno_selected();
  category_selected();

  // 페이지 로드될때 이벤트 처리
  toggleButton();

// 미분류 문자를 null로 바꾸는 함수
  replaceNull();

  // select 요소의 값이 변경될 때 이벤트 처리
  $("select[name='collabo']").change(function () {
    toggleButton();
    replaceNull();
  });
});

// 시간 형식 변환 함수
function convertTimeTo24Hours(timeString) {
  let [time, meridiem] = timeString.split(" "); // 시간과 AM/PM을 분리

  let [hours, minutes, seconds] = time.split(":"); // 시간, 분, 초를 추출

  // 오후인 경우 시간을 12를 더해서 24시간 형식으로 변환
  if (meridiem === "오후") {
    hours = String(Number(hours) + 12).padStart(2, "0");
  }

  // 24시간 형식으로 조합하여 반환
  return `${hours}:${minutes}:${seconds}`;
}

// 월 이름을 숫자로 변환하는 함수
function getMonthNumber(monthName) {
  const months = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];
  return months.indexOf(monthName) + 1;
}

// archiveupdate.jsp 비동기 적용 함수
function test2(resData) {
  let $body = $("body");
  $body.html("");
  for (let i = 0; i < resData.length; i++) {
    let archive = resData[i];

    const dateString = archive.a_date;
    // 문자열을 공백과 쉼표로 분리하여 구성 요소 추출
    const [monthName, day, year] = dateString.replace(",", "").split(" ");
    // 월을 숫자로 변환
    const month = String(getMonthNumber(monthName)).padStart(2, "0");
    const dayPadded = String(day).padStart(2, "0");

    // yyyy-MM-dd 형식으로 변환
    const formattedDate = `${year}-${month}-${dayPadded}`;

    const formattedTime = convertTimeTo24Hours(archive.a_time);

    let html = `<div id="archive-list2">
      <form method="post">
        <div class="archive-contents-update">
          <div>
            <button id="updateButton" class="cute-button">修正</button>
          </div>
          <p>
            <img class="archive-icon" src="haco_img/icon/${archive.i_icon}" />
          </p>
          <input type="hidden" name="a_pk" value="${archive.a_pk}" />
          <div class="archive-membername">${archive.m_name}</div>

          <div class="archive-collabo">
            <div>コラボ</div>
            <select name="collabo">
              <option value="未分類">未分類</option>
              <option value="外部コラボ">外部コラボ</option>
              <option value="ハコ内コラボ">ハコ内コラボ</option>
              <option value="なし">なし</option>
            </select>
            <input
              class="collabo-value"
              type="hidden"
              value="${archive.a_collabo}"
            />
          </div>
          <div class="archive-collabo-member">
            <div style="font-size: 11pt">コラボメンバー</div>
            <button
              type="button"
              onclick="openModal(this)"
              class="openModalButton"
            >
              選択
            </button>
            <input
              type="hidden"
              class="collaboMember"
              name="collabomember"
              value="${archive.a_collabomember}"
            />
            <div class="collaboMember2"></div>
          </div>
          <div class="archive-category">
            <div>カテゴリー</div>
            <select name="category">
              <option value="未分類">未分類</option>
              <option value="雑談">雑談</option>
              <option value="歌枠">歌枠</option>
              <option value="ゲーム">ゲーム</option>
              <option value="企画">企画</option>
              <option value="ASMR">ASMR</option>
              <option value="shorts">shorts</option>
              <option value="切り抜き">切り抜き</option>
              <option value="オリジナル曲">オリジナル曲</option>
              <option value="他">他</option>
            </select>
            <input
              class="category-value"
              type="hidden"
              value="${archive.a_category}"
            />
          </div>
          <div class="archive-date">${archive.a_date}</div>
          <div class="archive-time">${archive.a_time}</div>
          <div class="archive-title">${archive.a_title}</div>
          <div class="archive-thumbnail">
            <img
              src="${archive.a_thumbnail}"
              alt="${archive.a_title} Thumbnail"
            />
          </div>
        </div>
      </form>
    </div>

    <div class="dialog-container" id="myModal">
      <div class="modal-content">
        <span id="close" onclick="closeModal()">&times;</span>
        <div id="checkboxForm" class="form-container">
          <p>Select your options:</p>
          <div>
            <div class="archive-modal-detail-gen">
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="七彩てまり"
                    />七彩てまり</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="田中りゅこ"
                    />田中りゅこ</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="夜夢瑠紅"
                    />夜夢瑠紅</label
                  >
                </div>
              </div>
            </div>
            <div class="archive-modal-detail-gen">
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="赤衣アカメ"
                    />赤衣アカメ</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="星ノ音コロン"
                    />星ノ音コロン</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="愛咲よつのは"
                    />愛咲よつのは</label
                  >
                </div>
              </div>
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="玉ノ井もなか"
                    />玉ノ井もなか</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="綾坂希穂"
                    />綾坂希穂</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="ソフィ・ローズ"
                    />ソフィ・ローズ</label
                  >
                </div>
              </div>
            </div>
            <div class="archive-modal-detail-gen">
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="天海くりね"
                    />天海くりね</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="鳳儚"
                    />鳳儚</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="小日向千虎"
                    />小日向千虎</label
                  >
                </div>
              </div>
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="白砂つな"
                    />白砂つな</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="橘シエナ"
                    />橘シエナ</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="ミラ・ルプス"
                    />ミラ・ルプス</label
                  >
                </div>
              </div>
            </div>
            <div class="archive-modal-detail-gen">
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="銀灰まお"
                    />銀灰まお</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="リン・ガーネット"
                    />リン・ガーネット</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="明堂しろね"
                    />明堂しろね</label
                  >
                </div>
              </div>
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="華糖シェリー"
                    />華糖シェリー</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="ぺるぽ"
                    />ぺるぽ</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="叶望ゆゆ"
                    />叶望ゆゆ</label
                  >
                </div>
              </div>
            </div>
            <div class="archive-modal-detail-gen">
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="雫川なのか"
                    />雫川なのか</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="堕天しすた"
                    />堕天しすた</label
                  >
                </div>
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="山寧恋"
                    />山寧恋</label
                  >
                </div>
              </div>
              <div class="archive-modal-detail">
                <div>
                  <label
                    ><input
                      type="checkbox"
                      name="collabomember"
                      value="翠森アトリ"
                    />翠森アトリ</label
                  >
                </div>
              </div>
            </div>
          </div>
          <button
            class="cute-button"
            type="button"
            name="collabomember"
            value="selectedOptions"
            id="submitButton"
            onclick="applyModal()"
            style="margin-top: 5px"
          >
            apply
          </button>
        </div>
      </div>
    </div>`;
    $body.append(html);
  }
}

// 투명도를 조절하는 함수
function adjustOpacity2(opacityValue) {
  $("#archive-list2").animate({ opacity: opacityValue }, 350);
}

// 모달 팝업 기능
let activeBtn;
let activeInput;
let activeDiv;
function openModal(btn) {
  var closeButton = document.querySelector("#close");
  var submitButton = document.querySelector("#submitButton");
  activeBtn = btn;
  activeInput = btn.parentElement.children[2];
  activeDiv = btn.parentElement.children[3];
  console.log(activeInput);
  console.log(activeBtn);
  console.log(activeDiv);
  console.log("-----------");
  document.querySelectorAll("input[name='collabomember']").forEach((asd) => {
    asd.checked = false;
    if (activeInput.value.indexOf(asd.value) != -1) {
      asd.checked = true;
    }
  });
  console.log("-----------");

  var modal = document.querySelector("#myModal");
  modal.style.display = "block";
}

function applyModal() {
  var closeButton = document.querySelector("#close");
  console.log("Submit button clicked");
  let form = document.querySelector(".dialog-container .form-container");
  let selectedOptions = [];
  let checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(function (checkbox) {
    selectedOptions.push(checkbox.value);
  });
  console.log(activeBtn);
  console.log(selectedOptions);
  //   activeBtn.innerText = selectedOptions.join("<br>");
  activeInput.value = selectedOptions.join("!");
  //   activeDiv.innerText = selectedOptions.join("\n");

  let a = $(activeBtn.nextElementSibling);
  replaceCollabomemberString(a);

  document
    .querySelectorAll("#checkboxForm input[type='checkbox']:checked")
    .forEach((chkInput) => {
      chkInput.checked = false;
    });

  closeButton.click();
}

function closeModal() {
  document.querySelector("#myModal").style.display = "none";
}
// 콜라보 yes, no 를 선택한값에 맞게 적용하기
function collabo_yesno_selected() {
  document.querySelectorAll("select[name='collabo']").forEach((select) => {
    Array.from(select.options).forEach((option) => {
      if (option.value == select.nextElementSibling.value) {
        option.selected = true;
      }
    });
  });
}

// 카테고리를 수정한값에 맞게 표시해주기
function category_selected() {
  document.querySelectorAll("select[name='category']").forEach((select) => {
    //    console.log(select.nextElementSibling.value);
    //  console.log("Select element:", select);
    Array.from(select.options).forEach((option) => {
      //    console.log("Option value:", option.value);
      if (option.value == select.nextElementSibling.value) {
        option.selected = true;
      }
    });
  });
}
//ハコ内コラボ일때만 버튼 나오게
function toggleButton() {
  $("select[name='collabo']").each(function () {
    let select = $(this);
    let openModalButton = select
      .closest(".archive-collabo")
      .next(".archive-collabo-member")
      .find(".openModalButton");
    if (select.val() === "ハコ内コラボ") {
      openModalButton.css("display", "block");
    } else {
      openModalButton.css("display", "none");
    }

    // ハコ内コラボ 아닐때 콜라보멤버 초기화 함수
     let select2 = $(this);
    let openModalButton2 = select2
      .closest(".archive-collabo")
      .next(".archive-collabo-member");
    console.log(select2.val());
    if (select2.val() != "ハコ内コラボ") {
      openModalButton2.find(".collaboMember2").text("未分類");
      openModalButton2.find("input").val("未分類");
    } 
  });
}

// 콜라보 멤버 문자열을 div로 감싸 표현하는 함수
function replaceCollabomemberString(a) {
  // jQuery를 사용하여 NodeList를 가져오기 (hidden된 input 자체를 가져와야함)
  let collabomemberStrings = a;
  // NodeList를 배열로 변환하여 forEach 메서드 사용
  $(collabomemberStrings).each(function (idx, collabomemberString) {    
    let collabomemberStringUpdate = collabomemberString.value.split("!");
    let divWrappedArray = collabomemberStringUpdate.map(
      (item) =>
        `<div class="archive-collabo-member-item archive-${item}">${item}</div>`
    );
    // jQuery를 사용하여 해당 요소의 자식 요소에 추가하기
    //console.log(this);
    $(this)
      .closest(".archive-collabo-member")
      .find(".collaboMember2")
      .html(divWrappedArray.join(""));
  });
}

// 미분류 문자를 null로 바꾸는 함수
function replaceNull() {
  $(".collaboMember2").each(function () {
    let textInDiv = $(this);
    console.log(textInDiv.text());
    if (textInDiv.text() == "未分類") {
      textInDiv.text("");
    }
  });
}

function updateArchive() {
	$(document).on("click", "#updateButton", function () {
    $.ajax({
      url: "ArchiveUpdateC",
      type: "post",
      data: { a_pk, collabo, collabomember, category },
      dataType: "json",
    }).done(function (resData) {
      history.back();
      
      
    });
  });
	
}

function updatePage() {
	
}



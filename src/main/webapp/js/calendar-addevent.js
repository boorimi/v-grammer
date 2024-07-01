document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    // 현재 날짜 정보를 가져옴
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();

    // 현재 날짜를 YYYY-MM-DD 형식으로 변환
    var currentDate = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    console.log("현재 날짜:", currentDate);

    // FullCalendar 객체를 생성하고 초기화
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialDate: currentDate, // 캘린더 초기 날짜 설정
        editable: false,          // 이벤트 편집 비활성화
        selectable: false,        // 날짜 선택 비활성화
        businessHours: true,      // 영업 시간 표시
        dayMaxEvents: true,       // 하루에 표시할 최대 이벤트 수
        events: [],               // 초기에는 빈 배열로 설정
        eventDidMount: function(info) {
            // 이벤트 바에 마우스 오버 시 popover 표시
            addPopoverToEvent(info.el, info.event);
        },
        eventMoreLinkDidMount: function(info) {
            // 'more...' 링크의 popover 위치를 오른쪽으로 조정
            var popover = info.el.querySelector('.fc-popover');
            if (popover) {
                popover.style.left = 'unset';
                popover.style.right = '0';
            }
        }
    });

    // 캘린더를 렌더링
    calendar.render();
    console.log("캘린더가 렌더링되었습니다.");

    var loadedEvents = []; // 서버에서 로드한 이벤트를 저장할 배열

    // 최초 로드 시 현재 연도와 4년 후까지의 모든 이벤트를 로드
    loadEventsForYears(year, year + 4, calendar);

    // FullCalendar의 버튼들에 클릭 이벤트를 추가
    const buttons = document.querySelectorAll('.fc-button');
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            console.log("버튼이 클릭되었습니다.");
            // 버튼 클릭 시 이벤트를 업데이트하는 함수 호출
            updateEvents(year, year + 4, calendar);
        });
    });

    function loadEventsForYears(startYear, endYear, calendar) {
        console.log(`이벤트 로드 시작: ${startYear}년부터 ${endYear}년까지`);
        // 캘린더 로딩 메세지 표시
        alert("カレンダーを読み込み中です。 OKボタンを押したら 読み込めます。時間がかかる場合があります。");
        
        $.ajax({
            url: 'CalendarEventC',  // 서버에서 이벤트 데이터를 가져올 URL
            type: 'GET',
            data: { year: startYear }, // 첫 요청은 현재 연도 기준
            dataType: 'json',
            success: function(res) {
                console.log("AJAX 응답:", res);
                loadedEvents = res; // 서버에서 로드한 이벤트 저장
                addEventsForYears(res, startYear, endYear, calendar);
                // 로딩 메시지 닫기
                alert("読み込み完了！");
            },
            error: function(err) {
                console.error("Error fetching events: ", err);
            }
        });
    }

    function addEventsForYears(events, startYear, endYear, calendar) {
        console.log(`이벤트 추가 시작: ${startYear}년부터 ${endYear}년까지`);
        for (let year = startYear; year <= endYear; year++) {
            console.log(`연도: ${year}`);
            events.forEach(event => {
                let newEvent = { ...event };
                newEvent.start = incrementYear(event.start, year - new Date(event.start).getFullYear());
                if (newEvent.title.includes('の誕生日')) {
                    newEvent.color = 'red';
                }
                console.log("새 이벤트 추가:", newEvent);
                calendar.addEvent(newEvent);
            });
        }
    }

    function updateEvents(startYear, endYear, calendar) {
        console.log(`이벤트 업데이트 시작: ${startYear}년부터 ${endYear}년까지`);
        $.ajax({
            url: 'CalendarEventC',  // 서버에서 이벤트 데이터를 가져올 URL
            type: 'GET',
            data: { year: startYear },
            dataType: 'json',
            success: function(res) {
                console.log("AJAX 응답:", res);
                let eventsToRemove = loadedEvents.filter(event => !res.some(newEvent => newEvent.id === event.id));
                let eventsToAdd = res.filter(newEvent => !loadedEvents.some(event => event.id === newEvent.id));

                console.log("제거할 이벤트:", eventsToRemove);
                console.log("추가할 이벤트:", eventsToAdd);

                if (eventsToRemove.length > 0 || eventsToAdd.length > 0) {
                    eventsToRemove.forEach(event => {
                        console.log("이벤트 제거:", event);
                        calendar.getEventById(event.id).remove();
                    });

                    eventsToAdd.forEach(event => {
                        let newEvent = { ...event };
                        newEvent.start = incrementYear(event.start, year - new Date(event.start).getFullYear());
                        if (newEvent.title.includes('の誕生日')) {
                            newEvent.color = 'red';
                        }
                        console.log("새 이벤트 추가:", newEvent);
                        calendar.addEvent(newEvent);
                    });

                    loadedEvents = res;
                    console.log("이벤트가 업데이트되었습니다.");
                } else {
                    console.log("변동 사항이 없습니다.");
                }
            },
            error: function(err) {
                console.error("Error fetching events: ", err);
            }
        });
    }

    function incrementYear(dateStr, increment) {
        let date = new Date(dateStr);
        date.setFullYear(date.getFullYear() + increment);
        let newDateStr = date.toISOString().split('T')[0];
        console.log(`날짜 변환: ${dateStr} -> ${newDateStr}`);
        return newDateStr;
    }

    function addPopoverToEvent(eventEl, event) {
        let popover = null; // popover 요소를 저장할 변수
        let popoverTimer = null; // popover 삭제를 위한 타이머 변수

        function createPopover() {
            if (!popover) {
                popover = document.createElement('div');
                popover.className = 'popover fade bs-popover-top';
                popover.role = 'tooltip';
                popover.innerHTML = `
                    <style>
                        .popover {
                            z-index: 9999; /* z-index를 높게 설정하여 최상단에 오도록 함 */
                        }
                    </style>
                    <div class="arrow"></div>
                    <h3 class="popover-header">${event.title}</h3>
                    <div class="popover-body">
                        ${event.extendedProps.imagePath ? `<img src="${event.extendedProps.imagePath}" alt="event image">` : ''}
                    </div>
                `;
                document.body.appendChild(popover);
            }
        }

        function destroyPopover() {
            if (popover) {
                popover.remove();
                popover = null;
            }
        }

        function showPopover() {
            createPopover();
            positionPopover(popover, eventEl);
            popover.classList.add('show');
            // popover가 보이면 타이머 초기화
            clearTimeout(popoverTimer);
        }

        function hidePopover() {
            // 0.4초 뒤에 popover 삭제하는 타이머 설정
            popoverTimer = setTimeout(function() {
                destroyPopover();
            }, 400);
        }

        eventEl.addEventListener('mouseenter', function() {
            showPopover();
        });

        eventEl.addEventListener('mouseleave', function() {
            hidePopover();
        });

        document.addEventListener('scroll', function() {
            if (popover) {
                positionPopover(popover, eventEl);
            }
        });

        document.addEventListener('click', function(e) {
            if (popover && !popover.contains(e.target) && e.target !== eventEl && !eventEl.contains(e.target)) {
                destroyPopover();
            }
        });

        function positionPopover(popover, eventEl) {
            let rect = eventEl.getBoundingClientRect();
            popover.style.top = `${rect.top + window.scrollY - popover.offsetHeight}px`;
            popover.style.left = `${rect.left + rect.width / 2 - popover.offsetWidth / 2}px`;
        }
    }

});

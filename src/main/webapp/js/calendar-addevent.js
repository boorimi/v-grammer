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
    });

    // 캘린더를 렌더링
    calendar.render();
    console.log("캘린더가 렌더링되었습니다.");

    var loadedEvents = []; // 서버에서 로드한 이벤트를 저장할 배열

    // 최초 로드 시 현재 연도와 4년 후까지의 모든 이벤트를 로드
    loadEventsForYears(year, year + 4, calendar);

    // FullCalendar의 버튼들에 클릭 이벤트를 추가
    const btns = document.querySelectorAll('.fc-button');
    btns.forEach((btn) => {
        btn.addEventListener("click", () => {
            console.log("버튼이 클릭되었습니다.");
            // 버튼 클릭 시 이벤트를 업데이트하는 함수 호출
            updateEvents(year, year + 4, calendar);
        });
    });

    /**
     * 지정된 연도 범위 내에서 이벤트를 로드하는 함수
     * @param {number} startYear - 시작 연도
     * @param {number} endYear - 종료 연도
     * @param {object} calendar - FullCalendar 객체
     */
    function loadEventsForYears(startYear, endYear, calendar) {
        console.log(`이벤트 로드 시작: ${startYear}년부터 ${endYear}년까지`);
        $.ajax({
            url: 'CalendarEventC',  // 서버에서 이벤트 데이터를 가져올 URL
            type: 'GET',
            data: { year: startYear }, // 첫 요청은 현재 연도 기준
            dataType: 'json',
            success: function(res) {
                console.log("AJAX 응답:", res);
                loadedEvents = res; // 서버에서 로드한 이벤트 저장
                addEventsForYears(res, startYear, endYear, calendar);
            },
            error: function(err) {
                console.error("Error fetching events: ", err);
            }
        });
    }

    /**
     * 지정된 연도 범위 내에서 이벤트를 추가하는 함수
     * @param {Array} events - 이벤트 배열
     * @param {number} startYear - 시작 연도
     * @param {number} endYear - 종료 연도
     * @param {object} calendar - FullCalendar 객체
     */
    function addEventsForYears(events, startYear, endYear, calendar) {
        console.log(`이벤트 추가 시작: ${startYear}년부터 ${endYear}년까지`);
        for (let year = startYear; year <= endYear; year++) {
            console.log(`연도: ${year}`);
            events.forEach(event => {
                let newEvent = { ...event };
                newEvent.start = incrementYear(event.start, year - new Date(event.start).getFullYear());
                console.log("새 이벤트 추가:", newEvent);
                calendar.addEvent(newEvent);
            });
        }
    }

    /**
     * 이벤트를 업데이트하는 함수
     * @param {number} startYear - 시작 연도
     * @param {number} endYear - 종료 연도
     * @param {object} calendar - FullCalendar 객체
     */
    function updateEvents(startYear, endYear, calendar) {
        console.log(`이벤트 업데이트 시작: ${startYear}년부터 ${endYear}년까지`);
        $.ajax({
            url: 'CalendarEventC',  // 서버에서 이벤트 데이터를 가져올 URL
            type: 'GET',
            data: { year: startYear }, // 첫 요청은 현재 연도 기준
            dataType: 'json',
            success: function(res) {
                console.log("AJAX 응답:", res);
                // 이전에 추가된 이벤트와 비교하여 변동 사항 확인
                let eventsToRemove = loadedEvents.filter(event => !res.some(newEvent => newEvent.id === event.id));
                let eventsToAdd = res.filter(newEvent => !loadedEvents.some(event => event.id === newEvent.id));

                console.log("제거할 이벤트:", eventsToRemove);
                console.log("추가할 이벤트:", eventsToAdd);

                // 변동 사항이 있는 경우만 처리
                if (eventsToRemove.length > 0 || eventsToAdd.length > 0) {
                    eventsToRemove.forEach(event => {
                        console.log("이벤트 제거:", event);
                        calendar.getEventById(event.id).remove(); // 이벤트 제거
                    });

                    eventsToAdd.forEach(event => {
                        let newEvent = { ...event };
                        newEvent.start = incrementYear(event.start, year - new Date(event.start).getFullYear());
                        console.log("새 이벤트 추가:", newEvent);
                        calendar.addEvent(newEvent); // 이벤트 추가
                    });

                    loadedEvents = res; // 변경된 이벤트로 업데이트
                    console.log("이벤트가 업데이트되었습니다.");
                }
            },
            error: function(err) {
                console.error("Error fetching events: ", err);
            }
        });
    }

    /**
     * 주어진 날짜 문자열에 지정된 연도를 더하는 함수
     * @param {string} dateStr - 날짜 문자열 (YYYY-MM-DD 형식)
     * @param {number} increment - 더할 연도 수
     * @return {string} - 연도가 추가된 새로운 날짜 문자열
     */
    function incrementYear(dateStr, increment) {
        let date = new Date(dateStr);
        date.setFullYear(date.getFullYear() + increment);
        let newDateStr = date.toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식으로 반환
        console.log(`날짜 변환: ${dateStr} -> ${newDateStr}`);
        return newDateStr;
    }
});

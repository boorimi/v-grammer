<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%> <%@ taglib prefix="c"
uri="http://java.sun.com/jsp/jstl/core" %> <%@ taglib prefix="fn"
uri="http://java.sun.com/jsp/jstl/functions" %>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>お知らせ</title>
    <script
      src="https://code.jquery.com/jquery-3.7.1.js"
      integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4="
      crossorigin="anonymous"
    ></script>
    <link rel="stylesheet" href="css/announcement.css" />
    <link rel="stylesheet" href="css/archive.css" />
  </head>
  <body>
    <div class="announcement-container">
      <div class="announcement-title">
        <p>お知らせ</p>
      </div>
      <div class="announcement-conmain">
        <!-- 본문페이지 for문 시작 -->
        <c:set var="totalItems" value="${fn:length(announcements)}" />
        <c:forEach var="a" items="${announcements }" varStatus="status">
          <div class="announcement-content">
            <div class="announcement-number">${totalItems - status.index}</div>
            <div onclick="location.href='SelectAnnouncement?no=${a.pk}'" class="announcement-con-title">
              ${a.title }
            </div>
            <div class="announcement-con-txt">${a.date }</div>
          </div>
        </c:forEach>
        <!-- 본문페이지 for문 끝 -->
      </div>
      <c:if test="${sessionScope.twitterId == 459978973 }">
      <div id="insert-button">
        <button class="cute-button-blue" onclick="location.href='InsertAnnouncement'">글쓰기</button>
      </div>
      </c:if>
      <!-- 글쓰기 끝 -->
      <!-- 하단 페이징 시작 -->
      <div class="archive-paging-container">
        <c:set var="pageUnit" value="4" />
        <c:set
          var="page"
          value="${fn:substringBefore(Math.floor((curPageNo - 1) div pageUnit) * pageUnit, '.')}"
        />
        <div class="archive-paging-start">
          <a href="AnnouncementPage?p=1">最初に</a>
        </div>
        <div class="archive-paging-unit-prev">
          <c:if test="${page != 0}">
            <a href="AnnouncementPage?p=${page - pageUnit + 1}"
              >이전 ${pageUnit }페이지</a
            >
          </c:if>
        </div>
        <div class="archive-paging-no-div">
          <c:forEach
            var="i"
            begin="${page+1 }"
            end="${page + pageUnit <= pageCount ? page + pageUnit : pageCount}"
          >
            <div class="archive-paging-no">
              <div onclick="location.href='AnnouncementPage?p=${i }'">${i }</div>
            </div>
          </c:forEach>
        </div>
        <div class="archive-paging-unit-next">
          <c:if
            test="${page + (curPageNo % pageUnit) < pageCount - (pageCount % pageUnit) && page + pageUnit != pageCount}"
          >
            <a href="AnnouncementPage?p=${page + pageUnit + 1 }"
              >다음 ${pageUnit }페이지</a
            >
          </c:if>
        </div>
        <div class="archive-paging-end">
          <a href="AnnouncementPage?p=${pageCount}">끝</a>
        </div>
      </div>
    </div>
    <!-- <div>
      <input id="search-input" />
      <button id="search-btn">버튼</button>
      <hr />
      <span id="result"></span>
    </div> -->
  </body>
</html>

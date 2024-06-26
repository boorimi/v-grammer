<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%> <%@ taglib prefix="c"
uri="http://java.sun.com/jsp/jstl/core"%> <%@ taglib prefix="fn"
uri="http://java.sun.com/jsp/jstl/functions"%>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>トレード</title>
    <script
      src="https://code.jquery.com/jquery-3.7.1.js"
      integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4="
      crossorigin="anonymous"
    ></script>
    <script src="js/trade.js" defer></script>
    <link rel="stylesheet" href="css/trade.css" />
    <link rel="stylesheet" href="css/archive.css" />
  </head>
  <body>
    <div class="trade-container">
      <div class="trade-title">
        <p>トレード</p>
        <div class="trade-menu" style="display: flex">
          <div class="trade-menu-category">
            <button class="trade-openCategorys cute-button-gray">
              カテゴリーで検索 ▼
            </button>
          </div>
          <div class="trade-menu-name">
            <button class="trade-openSearch cute-button-gray">
              名前で検索 ▼
            </button>
          </div>
        </div>
        <div id="insert-button">
          <button
            class="cute-button-blue"
            onclick="location.href='InsertTrade'"
          >
            作成
          </button>
        </div>
      </div>
      <form action="Trade">
        <c:choose>
          <c:when test="${category3 != null}">
            <c:set var="displayValue" value="flex" />
          </c:when>
          <c:otherwise>
            <c:set var="displayValue" value="none" />
          </c:otherwise>
        </c:choose>
        <div class="trade-category" style="display: ${displayValue};">
          <c:forEach items="${checkboxItems }" var="cbi">
            <div>
              <label
                ><input type="checkbox" name="goodsCategory" value="${cbi.key }"
                ${fn:contains(category3, cbi.key) ? 'checked="checked"' : ''}
                />${cbi.value }</label
              >
            </div>
          </c:forEach>
          <button class="cute-button-blue" id="trade-search-category">
            検索
          </button>
        </div>
      </form>
      <form action="Trade">
        <c:choose>
          <c:when test="${name2 != null}">
            <c:set var="displaySearch" value="flex" />
          </c:when>
          <c:otherwise>
            <c:set var="displaySearch" value="none" />
          </c:otherwise>
        </c:choose>
        <div class="trade-search" style="display: ${displaySearch};">
          <input type="text" name="name" value="${name }" />
          <button class="cute-button-blue" id="trade-search-name">検索</button>
        </div>
      </form>

      <div class="trade-conmain">
        <!-- 본문페이지 for문 시작 -->
        <c:set var="totalItems" value="${fn:length(trades)}" />
        <c:forEach var="t" items="${trades }" varStatus="status">
          <div class="trade-content">
            <div class="trade-content-title">
              <div>${t.nickname}</div>
              <div>
                <a target="_blnck" href="https://x.com/${t.screenName}"
                  ><img src="haco_img/icon-twitter.png"
                /></a>
              </div>
              <div>${t.date}</div>
            </div>
            <div class="trade-content-category">
              <!--  카테고리 for문 시작 -->
              <c:forEach var="c" items="${t.category }">
                <c:forEach var="item" items="${checkboxItems}">
                  <c:if test="${item.key == c}">
                    <div class="trade-goods-category">${item.value}</div>
                  </c:if>
                </c:forEach>
              </c:forEach>
              <!-- 카테고리for문 끝 -->
            </div>
            <div class="trade-content-text">
              <div class="trade-con-title">${t.text }</div>
              <c:if test="${sessionScope.twitterId == t.twitterId}">
                <div>
                  <a onclick="location.href='UpdateTrade?no=${t.pk}'">
                    <img class="crud-icon" src="haco_img/update.png" alt="" />
                  </a>
                </div>
                <div>
                  <a onclick="tradeDelete(${t.pk})">
                    <img class="crud-icon" src="haco_img/delete.png" alt="" />
                  </a>
                </div>
              </c:if>
            </div>

            <!-- 댓글 for문 시작 -->
            <c:set var="i" value="0" />
            <c:forEach var="tc" items="${tradeComments }">
              <c:if test="${tc.t_pk == t.pk }">
                <div class="trade-comments" style="display: none; margin: 15px">
                  <div>
                    <div>${tc.sNickname}</div>
                    <div>${tc.date }</div>
                  </div>
                  <div>
                    <div>${tc.text}</div>
                    <c:if test="${sessionScope.twitterId == tc.sTwitterId}">
                      <div>
                        <a onclick="tradeCommentsDelete('${tc.pk}')">
                          <img
                            class="crud-icon"
                            src="haco_img/delete.png"
                            alt=""
                          />
                        </a>
                      </div>
                    </c:if>
                  </div>
                </div>
                <c:set var="i" value="${i + 1}" />
              </c:if>
            </c:forEach>
            <!-- 댓글 for문 끝 -->
            <div class="cute-button-box">
              <button class="trade-openComments cute-button-pink">
                コメント(${i })
              </button>
            </div>
            <div class="trade-comments" style="display: none; border: 0px">
              <form
                id="insertTradeCommentsForm_${t.pk }"
                action="InsertTradeComments"
              >
                <input name="no" type="hidden" value="${t.pk }" />
                <input
                  name="masterTwitterId"
                  type="hidden"
                  value="${t.twitterId}"
                />
                <textarea
                  style="width: 99%; height: 70px"
                  name="text"
                ></textarea>
                <button
                  class="cute-button-blue"
                  type="button"
                  onclick="tradeCommentsInsert('${t.pk }')"
                >
                  作成
                </button>
              </form>
            </div>
          </div>
        </c:forEach>
        <!-- 본문페이지 for문 끝 -->
      </div>
      <!--  여기부터 페이징  -->
      <div class="archive-paging-container">
        <div class="archive-paging-start">
          <a href="TradePage?p=1${category3 }${name2}">最初に</a>
        </div>
        <c:set var="pageUnit" value="5" />
        <c:set
          var="page"
          value="${fn:substringBefore(Math.floor((curPageNo - 1) div pageUnit) * pageUnit, '.')}"
        />
        <div class="archive-paging-unit-prev">
          <c:if test="${page != 0}">
            <a href="TradePage?p=${page - pageUnit + 1}${category3 }${name2}"
              >以前 ${pageUnit }ページ</a
            >
          </c:if>
        </div>
        <div class="archive-paging-no-div">
          <c:forEach
            var="i"
            begin="${page + 1 }"
            end="${page + pageUnit <= pageCount ? page + pageUnit : pageCount}"
          >
            <div
              class="archive-paging-no"
              onclick="location.href='TradePage?p=${i }${name2}${category3 }'"
            >
              ${i }
            </div>
          </c:forEach>
        </div>
        <div class="archive-paging-unit-next">
          <c:if
            test="${page + (curPageNo % pageUnit) < pageCount - (pageCount % pageUnit) && page + pageUnit != pageCount}"
          >
            <a href="TradePage?p=${page + pageUnit + 1 }${category3 }${name2}"
              >次 ${pageUnit }ページ</a
            >
          </c:if>
        </div>
        <div class="archive-paging-end">
          <a href="TradePage?p=${pageCount}${category3 }${name2}">最後に</a>
        </div>
      </div>
      <!--  페이징 끝 -->
    </div>
    <!-- <div>
      <input id="search-input" />
      <button id="search-btn">버튼</button>
      <hr />
      <span id="result"></span>
    </div> -->
  </body>
</html>

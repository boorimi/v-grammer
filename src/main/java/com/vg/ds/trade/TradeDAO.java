package com.vg.ds.trade;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.vg.ds.announcement.AnnouncementDTO;
import com.vg.ignore.DBManager;

public class TradeDAO {

	private ArrayList<TradeDTO> trades = null;
	private ArrayList<TradeCommentsDTO> tradeComments = null;
	private Connection con = null;
	public static final TradeDAO TDAO = new TradeDAO();

	private TradeDAO() {
		try {
			con = DBManager.connect();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public void paging(int page, HttpServletRequest request) {

		int cnt = 5; // 한페이지당 보여줄 개수
		int total = trades.size(); // 총 데이터 개수

		// 총 페이지 수 , 곧 마지막 페이지
		int pageCount = (int) (Math.ceil((double) total / cnt));
		// 시작, 끝

		int start = total - (cnt * (page - 1));
		int end = (page == pageCount) ? -1 : start - (cnt + 1);

		ArrayList<TradeDTO> items = new ArrayList<TradeDTO>();
		for (int i = start - 1; i > end; i--) {
			items.add(trades.get(i));
		}
		request.setAttribute("curPageNo", page);
		request.setAttribute("pageCount", pageCount);
		request.setAttribute("start", start);
		request.setAttribute("end", end);
		request.setAttribute("trades", items);
	}

	public void selectAllTrade(HttpServletRequest request) {

		PreparedStatement pstmt = null;
		ResultSet rs = null;

		try {

			String sql = "select t_pk, u_id, u_twitter_id, u_nickname, t_text, t_date, u_yesno, t_category ";
			sql += "from haco_tradegoods, haco_user ";
			sql += "where u_id = t_u_id ";
			////// 검색 진행 시 sql문 추가하는 부분 시작 ////
			if (request.getParameterValues("goodsCategory") != null) {
				String[] category2 = request.getParameterValues("goodsCategory");
				for (int i = 0; i < category2.length; i++) {
					if (i == 0) {
						sql += "and (";
					}
					sql += "t_category like CONCAT('%','" + category2[i] + "','%')";
					if (i == category2.length - 1) {
						sql += ") ";
					} else {
						sql += " or ";
					}
				}
				String category3 = "";
				for (String c : category2) {
					category3 += "&goodsCategory=" + c ;
				}
				request.setAttribute("category3", category3);
			}
			////// 검색 진행 시 sql문 추가하는 부분 끝 ////
			sql += "order by t_date asc";

			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			rs = pstmt.executeQuery();

			trades = new ArrayList<TradeDTO>();
			String[] category = null;

			while (rs.next()) {
				String pk = rs.getString(1);
				String twitterId = rs.getString(2);
				String id = rs.getString(3);
				String nickname = rs.getString(4);
				String text = rs.getString(5);
				String date = rs.getString(6);
				String yesno = rs.getString(7);

				// 배열로 전환
				category = rs.getString(8).split("!");
				TradeDTO t = new TradeDTO(pk, twitterId, id, nickname, text, date, yesno, category);
				trades.add(t);

			}
			
			
			request.setAttribute("trades", trades);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, rs);
		}

	}

	public void selectTrade(HttpServletRequest request) {

		PreparedStatement pstmt = null;
		ResultSet rs = null;

		try {

			String sql = "select t_pk, u_id, u_twitter_id, u_nickname, t_text, t_date, u_yesno, t_category ";
			sql += "from haco_tradegoods, haco_user ";
			sql += "where u_id = t_u_id and t_pk = ? ";

			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, request.getParameter("no"));
			rs = pstmt.executeQuery();
			rs.next();

			String pk = rs.getString(1);
			String twitterId = rs.getString(2);
			String id = rs.getString(3);
			String nickname = rs.getString(4);
			String text = rs.getString(5);
			String date = rs.getString(6);
			String yesno = rs.getString(7);

			// 카테고리를 배열로 다시 전환
			String[] category = rs.getString(8).split("!");
			// 본문내용 확인 할때 DB내용을 br -> 줄바꿈으로 대체하는 코드
			String text2 = text.replace("<br>", "\r\n");

			TradeDTO t = new TradeDTO(pk, twitterId, id, nickname, text2, date, yesno, category);

//			request.setAttribute("category", category);
			request.setAttribute("text2", text2);
			request.setAttribute("trades", t);
			tradeCheckboxList(request);

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, rs);
		}

	}

	public void insertTrade(HttpServletRequest request) {

		PreparedStatement pstmt = null;

		try {

			String[] category = request.getParameterValues("goodsCategory");
			String category2 = "";
			for (String s : category) {
				category2 += s + "!";
			}

			// 인서트 할때 DB에 줄바꿈 -> br 로 대체하는 코드
			String text = request.getParameter("text");
			text = text.replaceAll("\r\n", "<br>");

			String sql = "insert into haco_tradegoods values (null, 'ds6951', ?, NOW(), ?)";

			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, text);
			pstmt.setString(2, category2);

			if (pstmt.executeUpdate() == 1) {
				System.out.println("입력 성공!");
			}

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, null);
		}

	}

	public void deleteTrade(HttpServletRequest request) {

		PreparedStatement pstmt = null;

		try {

			String sql = "delete from haco_tradegoods where t_pk = ?";
			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, request.getParameter("no"));

			if (pstmt.executeUpdate() == 1) {
				System.out.println("삭제 성공!");
			}

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, null);
		}

	}

	public void updateTrade(HttpServletRequest request) {

		PreparedStatement pstmt = null;

		try {
			// 업데이트 할때 DB에 줄바꿈 -> br 로 대체하는 코드
			String text = request.getParameter("text");
			text = text.replace("\r\n", "<br>");

			String sql = "update haco_tradegoods set t_text = ? where t_pk = ?";

			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, text);
			pstmt.setString(2, request.getParameter("no"));

			if (pstmt.executeUpdate() == 1) {
				System.out.println("수정 성공!");
			}

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, null);
		}

	}

	public void selectTradeComments(HttpServletRequest request) {

		PreparedStatement pstmt = null;
		ResultSet rs = null;

		try {

			String sql = "select tc_pk, tc_m_id, u_twitter_id, u_nickname, tc_s_id, u_twitter_id, u_nickname, tc_text, tc_date, u_yesno, tc_t_pk ";
			sql += "from haco_user, haco_tradegoods_comments ";
			sql += "where tc_m_id = u_id ";
			sql += "and tc_s_id = u_id and u_yesno = 1 ";

			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
//			pstmt.setString(1, request.getParameter("no"));
			rs = pstmt.executeQuery();

			tradeComments = new ArrayList<TradeCommentsDTO>();

			while (rs.next()) {

				String pk = rs.getString(1);
				String mTwitterId = rs.getString(2);
				String mId = rs.getString(3);
				String mNickname = rs.getString(4);
				String sTwitterId = rs.getString(5);
				String sId = rs.getString(6);
				String sNickname = rs.getString(7);
				String text = rs.getString(8);
				String date = rs.getString(9);
				String yesno = rs.getString(10);
				String t_pk = rs.getString(11);

				// 본문내용 확인 할때 DB내용을 br -> 줄바꿈으로 대체하는 코드
				String text2 = text.replace("<br>", "\r\n");

				TradeCommentsDTO tc = new TradeCommentsDTO(pk, mTwitterId, mId, mNickname, sTwitterId, sId, sNickname,
						text2, date, yesno, t_pk);
				tradeComments.add(tc);

			}

			request.setAttribute("tradeComments", tradeComments);

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, rs);
		}

	}

	public void insertTradeComments(HttpServletRequest request) {

		PreparedStatement pstmt = null;

		try {
			// 인서트 할때 DB에 줄바꿈 -> br 로 대체하는 코드
			String text = request.getParameter("text");
			text = text.replaceAll("\r\n", "<br>");

			String sql = "insert into haco_tradegoods_comments values ";
			sql += "(null, ?, 'ds6951','ds6951',?,now())";

			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, request.getParameter("no"));
			pstmt.setString(2, text);

			if (pstmt.executeUpdate() == 1) {
				System.out.println("입력 성공!");
			}

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, null);
		}

	}

	public void tradeCheckboxList(HttpServletRequest request) {

		List<Map<String, String>> checkboxItems = new ArrayList<>();
		checkboxItems.add(Map.of("value", "bromide", "label", "白賞ブロマイド"));
		checkboxItems.add(Map.of("value", "57mmCanBadge", "label", "57mm缶バッジ"));
		checkboxItems.add(Map.of("value", "76mmCanBadge", "label", "76mm缶バッジ"));
		checkboxItems.add(Map.of("value", "akuki", "label", "SD絵アクキー"));
		checkboxItems.add(Map.of("value", "coaster", "label", "コスタ"));
		checkboxItems.add(Map.of("value", "omoideCyeki", "label", "思い出チェキ風カード"));
		checkboxItems.add(Map.of("value", "dmmMiniShikishi", "label", "DMM：色紙"));
		checkboxItems.add(Map.of("value", "dmm57CanBadge", "label", "DMM：57mm缶バッジ"));
		checkboxItems.add(Map.of("value", "dmmMiniAkusuta", "label", "DMM：ミニアクスタ"));
		checkboxItems.add(Map.of("value", "dmmCyeki", "label", "DMM：チェキ"));

		request.setAttribute("checkboxItems", checkboxItems);
	}

}

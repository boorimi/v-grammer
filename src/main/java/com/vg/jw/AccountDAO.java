package com.vg.jw;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.oreilly.servlet.MultipartRequest;
import com.oreilly.servlet.multipart.DefaultFileRenamePolicy;
import com.vg.ignore.DBManager;

import twitter4j.Twitter;
import twitter4j.User;

public class AccountDAO {

	public static void registerUser(HttpServletRequest request) throws IOException {
		Connection con = null;
		PreparedStatement pstmt = null;

		// 트위터 계정정보 가져오기
		HttpSession twitterSession = request.getSession();

		long twitterId = (long) twitterSession.getAttribute("twitterId");

		String twitterScreenName = (String) twitterSession.getAttribute("twitterScreenName");		
		System.out.println("AccountDAO테스트 출력(twitterId):"+ twitterId);
		System.out.println("AccountDAO테스트 출력(twitterScreenName):"+ twitterScreenName);
		
		//사진받을 준비
		String path = request.getServletContext().getRealPath("account/profileImg");

		// 파일처리
		MultipartRequest mr = new MultipartRequest(request, path, 1024 * 1024 * 10, "utf-8",
				new DefaultFileRenamePolicy());
		
		String inputId = mr.getParameter("register-input-id");
		String inputPw = mr.getParameter("register-input-pw");
		String inputNickname = mr.getParameter("register-input-nickname");
		
		String inputFile = mr.getFilesystemName("register-input-file");
		
		System.out.println(inputId);
		System.out.println(inputPw);
		System.out.println(inputNickname);
		System.out.println(inputFile);
		
		String sql = "INSERT INTO haco_user values(?, ?, ?, ?, 1, ?)";
		
		try {

			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, inputId);
			pstmt.setString(2, inputPw);
			pstmt.setLong(3, twitterId);
			pstmt.setString(4, inputNickname);
			pstmt.setString(5, inputFile);
			
			if (pstmt.executeUpdate() >= 1) {
				System.out.println("유저 등록 성공");

				System.out.println("어디로 갈지 설정");

			}

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, null);
		}

	}

	public static void login(HttpServletRequest request) {

		Connection con = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;

		String inputId = request.getParameter("login-input-id");
		String inputPw = request.getParameter("login-input-pw");

		String sql = "SELECT*FROM haco_user WHERE u_id = ?";

		AccountDTO accountInfo = null;
		try {

			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, inputId);
			rs = pstmt.executeQuery();

			String loginResult = "";
			if (rs.next()) {
				String dbPw = rs.getString("u_pw");

				if (inputPw.equals(dbPw)) {
					// 유저 정보 활성화 여부 검사
					if (rs.getInt("u_yesno") == 1) {
						System.out.println("로그인 성공");
						loginResult = "ログイン成功";

						// 계정 정보들 저장
						accountInfo = new AccountDTO();
						accountInfo.setU_id(rs.getString("u_id"));
						accountInfo.setU_pw(rs.getString("u_pw"));
						accountInfo.setU_twitter_id(rs.getLong("u_twitter_id"));
						accountInfo.setU_nickname(rs.getString("u_nickname"));
						accountInfo.setU_yesno(rs.getInt("u_yesno"));
						
						// 로그인 세션 생성
						HttpSession loginSession = request.getSession();
						loginSession.setAttribute("accountInfo", accountInfo);
						loginSession.setMaxInactiveInterval(60*10);

					} else {
						System.out.println("삭제되거나 비활성화된 아이디");
					}

				} else {
					System.out.println("비밀번호 오류");
					loginResult = "PW不一致です。";
				}

			}
			System.out.println("계정 id :" + accountInfo.getU_id());
			System.out.println("계정 pw :" + accountInfo.getU_pw());
			System.out.println("트위터id: " + accountInfo.getU_twitter_id());
			System.out.println("닉네임 : " + accountInfo.getU_nickname());
			System.out.println("계정 활성화 여부: " + accountInfo.getU_yesno());
			System.out.println(accountInfo);
			
			request.setAttribute("loginResult", loginResult);

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, rs);
		}

	}

}

package com.vg.bm.Member;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;

import com.vg.ignore.DBManager;

public class MemberDAO {
	private ArrayList<MemberDTO> members;
	private Connection con = null;
	public static final MemberDAO MDAO = new MemberDAO();

	public MemberDAO() {
		try {
			con = DBManager.connect();
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	// 멤버 정보 호출 메서드
	public void getAllMember(HttpServletRequest request) {
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		ResultSet rs2 = null;
		ResultSet rs3 = null;
		// 멤버와 멤버이미지 테이블을 보여주는 sql문 한 번에 작성.
		String sql = "select hm.m_pk, hm.m_name,hm.m_gen,hm.m_birth,hm.m_debut,hm.m_mother_name,hm.m_mother_twitter,\r\n"
				+ "hi.i_icon,hi.i_img,hi.i_3side,hi.i_background\r\n" + "from haco_member hm, haco_image hi\r\n"
				+ "where hm.m_pk = hi.i_m_pk;";
		try {
			con = DBManager.connect();
			pstmt = con.prepareStatement(sql);
			rs = pstmt.executeQuery();

			members = new ArrayList<MemberDTO>();
			AddressDTO addressDTO = null;
			ArrayList<AddressDTO> addrs = null;
			HashTagDTO hashTagDTO = null;
			ArrayList<HashTagDTO> hashTag = null;
			while (rs.next()) {
				// 멤버와 멤버이미지 테이블의 정보를 합쳐서 MemberDTO에 생성.
				MemberDTO member = new MemberDTO(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4),
						rs.getString(5), rs.getString(6), rs.getString(7), rs.getString(8), rs.getString(9),
						rs.getString(10), rs.getString(11));
																	// 멤버 pk
				sql = "select * from haco_address where a_m_pk=" + rs.getString(1);
				pstmt = con.prepareStatement(sql);
				rs2 = pstmt.executeQuery();
				addrs = new ArrayList<AddressDTO>();
				while (rs2.next()) {
					addressDTO = new AddressDTO(rs2.getString(1), rs2.getString(3), rs2.getString(4));
					addrs.add(addressDTO);
				}
//				System.out.println(addrs);
				member.setAddress(addrs);
				
				sql = "select * from haco_hashtag where h_m_pk=" + rs.getString(1);
				pstmt = con.prepareStatement(sql);
				rs3 = pstmt.executeQuery();
				hashTag = new ArrayList<HashTagDTO>();
				while (rs3.next()) {
					hashTagDTO = new HashTagDTO(rs3.getString(1),rs3.getString(3),rs3.getString(4));
					hashTag.add(hashTagDTO);
				}
				
				member.setHashTag(hashTag);
				members.add(member);
				
			}
//			System.out.println("~~~~~~~~~~~~~~~~~");
//			System.out.println(members);
//			System.out.println("~~~~~~~~~~~~~~~~~");

//			System.out.println(members.size());
			request.setAttribute("members", members);

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DBManager.close(con, pstmt, rs);
		}
	}



	
}

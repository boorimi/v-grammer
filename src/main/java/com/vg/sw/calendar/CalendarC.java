package com.vg.sw.calendar;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.vg.jw.AccountDAO;

@WebServlet("/CalendarC")
public class CalendarC extends HttpServlet {
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//		CalendarEvent.loadEvent(request, response);
	    request.setAttribute("content", "calendar/calendar.jsp");
	    AccountDAO.loginCheck(request);
	    request.getRequestDispatcher("index.jsp").forward(request, response); 
	}


    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }
}

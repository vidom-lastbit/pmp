// src/main/java/com/example/quiz_app_java/service/ExcelService.java
package com.example.quiz_app_java.service;

import com.example.quiz_app_java.model.Question;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelService {

    public List<Question> loadQuizData(String fileName) {
        List<Question> questions = new ArrayList<>();
        
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(fileName)) {
            
            // Dòng code đã gây ra lỗi "Không tìm thấy file" trước đó
            if (inputStream == null) {
                // Đảm bảo file được đặt tại src/main/resources/data/quiz.xlsx
                throw new RuntimeException("Không tìm thấy file: " + fileName + ". Hãy kiểm tra đường dẫn.");
            }
            
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            
            // Bỏ qua hàng tiêu đề (hàng 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Question q = new Question();
                
                // Lấy ID (cột 0)
                Cell idCell = row.getCell(0);
                if (idCell != null) {
                    // Xử lý ID có thể là số hoặc chuỗi trong Excel
                    if (idCell.getCellType() == CellType.NUMERIC) {
                        q.setId((int) idCell.getNumericCellValue());
                    } else if (idCell.getCellType() == CellType.STRING) {
                        q.setId(Integer.parseInt(idCell.getStringCellValue().trim()));
                    }
                }
                
                // Lấy Question (cột 1) và Options (cột 2-5)
                q.setQuestion(row.getCell(1, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue());
                q.setOptionA(row.getCell(2, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue());
                q.setOptionB(row.getCell(3, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue());
                q.setOptionC(row.getCell(4, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue());
                q.setOptionD(row.getCell(5, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue());
                
                // Lấy Answer (cột 6)
                q.setAnswer(row.getCell(6, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue().trim()); 
                
                questions.add(q);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tải dữ liệu Excel: " + e.getMessage());
        }
        return questions;
    }
}
// src/main/java/com/example/quiz_app_java/controller/QuizController.java
package com.example.quiz_app_java.controller;

import com.example.quiz_app_java.model.Question; 
import com.example.quiz_app_java.service.ExcelService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller; 
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import jakarta.annotation.PostConstruct; // Dùng jakarta cho Spring Boot 3+

@Controller
@RequestMapping("/")
public class QuizController {

    private final ExcelService excelService;
    private List<Question> allQuestions;

    // Lấy tên file từ application.properties, mặc định là data/quiz.xlsx
    @Value("${quiz.data.file:quiz.xlsx}") 
    private String quizFileName;

    public QuizController(ExcelService excelService) {
        this.excelService = excelService;
    }

    // Tải dữ liệu 1 lần khi ứng dụng khởi động
    @PostConstruct
    public void init() {
        allQuestions = excelService.loadQuizData(quizFileName); 
    }

    // Route trả về trang tĩnh (index.html)
    @GetMapping("/")
    public String index() {
        return "index.html"; 
    }
    
    // API trả về câu hỏi (RestController riêng để giữ @Controller cho "/")
    @RestController
    @RequestMapping("/api")
    public class QuizRestController {

        @GetMapping("/questions")
        public List<Question> getQuestions() {
            // Lọc bỏ đáp án đúng trước khi gửi (bảo mật)
            return allQuestions.stream()
                .map(q -> new Question(q.getId(), q.getQuestion(), q.getOptionA(), 
                                       q.getOptionB(), q.getOptionC(), q.getOptionD(), null)) // Đặt Answer là null
                .collect(Collectors.toList());
        }

        @PostMapping("/submit")
        public Map<String, Object> submitAnswers(@RequestBody Map<String, Map<String, String>> requestBody) {
            Map<String, String> userAnswers = requestBody.get("answers"); // Lấy map answers từ body JSON
            int score = 0;
            int total = allQuestions.size();
            
            // Dùng Map để lưu kết quả chi tiết (đáp án đúng)
            Map<String, String> correctAnswers = allQuestions.stream()
                .collect(Collectors.toMap(
                    q -> String.valueOf(q.getId()), 
                    Question::getAnswer
                ));

            // Chấm điểm
            for (Question q : allQuestions) {
                String qId = String.valueOf(q.getId());
                String userAnswerKey = userAnswers.get(qId);
                
                if (q.getAnswer().equalsIgnoreCase(userAnswerKey)) {
                    score++;
                }
            }
            
            return Map.of(
                "score", score,
                "total", total,
                "correct_answers", correctAnswers 
            );
        }
    }
}
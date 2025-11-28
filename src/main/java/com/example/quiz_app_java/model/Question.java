// src/main/java/com/example/quiz_app_java/model/Question.java
package com.example.quiz_app_java.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor // Tạo constructor với tất cả tham số (cần cho QuizController)
@NoArgsConstructor  // Tạo constructor rỗng (cần cho Spring/JSON)
public class Question {
    private int id;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String answer; // Đáp án đúng (A, B, C, D)
}
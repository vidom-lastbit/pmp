# GIAI ĐOẠN 1: BUILD - Dùng JDK để biên dịch và đóng gói ứng dụng
FROM eclipse-temurin:17-jdk-jammy AS builder

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Sao chép file cấu hình Maven (pom.xml) và mã nguồn
COPY pom.xml .
COPY src /app/src

# Thực hiện lệnh build Maven (tạo file JAR, bỏ qua test để tăng tốc)
# (Sử dụng 'mvn package' nếu dự án của bạn không có mvnw)
RUN mvn package -DskipTests

# GIAI ĐOẠN 2: RUNTIME - Dùng JRE (nhẹ hơn) để chạy ứng dụng
FROM eclipse-temurin:17-jre-jammy AS final

# Expose port mặc định của Spring Boot (đảm bảo Render có thể truy cập)
EXPOSE 8080

# Sao chép file JAR đã build từ Giai đoạn 1 sang Giai đoạn 2
# *Lưu ý: Bạn phải thay thế [TÊN_FILE_JAR] bằng tên file JAR thực tế trong thư mục target/ của bạn.*
COPY --from=builder /app/target/*.jar app.jar

# Lệnh khởi chạy ứng dụng khi container chạy
ENTRYPOINT ["java", "-jar", "app.jar"]
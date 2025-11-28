# ==================================
# GIAI ĐOẠN 1: BUILDER (Xây dựng ứng dụng)
# Sử dụng JDK (Java Development Kit) để biên dịch code.
# ==================================
FROM eclipse-temurin:17-jdk-jammy AS builder

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# [QUAN TRỌNG: CÀI ĐẶT MAVEN]
# Cập nhật repository và cài đặt Maven, cần thiết cho các image JDK cơ bản
RUN apt-get update && apt-get install -y maven

# Sao chép file cấu hình Maven và mã nguồn
COPY pom.xml .
COPY src /app/src

# Thực hiện lệnh build Maven (tạo file JAR, bỏ qua test để tăng tốc)
RUN mvn package -DskipTests


# ==================================
# GIAI ĐOẠN 2: FINAL (Chạy ứng dụng)
# Sử dụng JRE (Java Runtime Environment) nhẹ hơn để giảm kích thước image cuối cùng.
# ==================================
FROM eclipse-temurin:17-jre-jammy AS final

# Khai báo cổng mà ứng dụng Spring Boot sử dụng
EXPOSE 8080

# Sao chép file JAR đã build từ Giai đoạn 1 (Builder)
# *Lưu ý: File *.jar sẽ được đổi tên thành app.jar.*
COPY --from=builder /app/target/*.jar app.jar

# Lệnh khởi chạy ứng dụng khi container bắt đầu
ENTRYPOINT ["java", "-jar", "app.jar"]
-- MySQL dump 10.13  Distrib 8.0.23, for Win64 (x86_64)
--
-- Host: localhost    Database: snap_review
-- ------------------------------------------------------
-- Server version	8.0.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(100) NOT NULL,
  `isParent` tinyint NOT NULL DEFAULT '0',
  `parentCategoryId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL,
  `iconUrl` varchar(2000) DEFAULT NULL,
  `rowStatus` tinyint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'CategoryName',1,NULL,'2021-03-21 11:19:29',NULL,NULL,0),(2,'CategoryName2',1,NULL,'2021-03-21 11:19:54',NULL,NULL,0),(3,'test',1,NULL,'2021-03-21 13:18:36',NULL,'google.com',1),(4,'test',1,NULL,'2021-03-21 13:23:19',NULL,'google.com',1),(5,'test2',1,3,'2021-03-21 13:24:09',NULL,'google.com',1),(6,'test3',1,3,'2021-03-21 13:26:21',NULL,'google.com',1),(7,'test3',1,3,'2021-03-21 13:26:42',NULL,'google.com',1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `imageLink` int DEFAULT NULL,
  `like` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `modifiedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductId_idx` (`productId`),
  CONSTRAINT `ProductId` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_upvotes`
--

DROP TABLE IF EXISTS `product_upvotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_upvotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `products_upvotes_idx` (`productId`),
  KEY `product_upvotes_users_idx` (`userId`),
  CONSTRAINT `product_upvotes_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `products_upvotes` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_upvotes`
--

LOCK TABLES `product_upvotes` WRITE;
/*!40000 ALTER TABLE `product_upvotes` DISABLE KEYS */;
INSERT INTO `product_upvotes` VALUES (1,55,1);
/*!40000 ALTER TABLE `product_upvotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `categoryId` int NOT NULL,
  `productName` varchar(500) NOT NULL,
  `views` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL,
  `isAnonymous` tinyint NOT NULL,
  `rowStatus` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `UserId_idx` (`userId`),
  KEY `CategoryId_idx` (`categoryId`),
  CONSTRAINT `CategoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`),
  CONSTRAINT `UserId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,55,5,'Mouse Razer',4,'2021-03-28 02:30:03',NULL,0,1),(2,55,5,'Mouse Corsair',0,'2021-03-28 14:13:16',NULL,0,1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_answers`
--

DROP TABLE IF EXISTS `question_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `upvote` int NOT NULL DEFAULT '0',
  `rate` int NOT NULL DEFAULT '0',
  `views` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `modifiedAt` datetime DEFAULT NULL,
  `questionsId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `questionAnsweres_Questions_idx` (`questionsId`),
  KEY `questionAnswers_Users_idx` (`userId`),
  CONSTRAINT `questionAnswers_Questions` FOREIGN KEY (`questionsId`) REFERENCES `questions` (`id`),
  CONSTRAINT `questionAnswers_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_answers`
--

LOCK TABLES `question_answers` WRITE;
/*!40000 ALTER TABLE `question_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_comments`
--

DROP TABLE IF EXISTS `question_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rate` int NOT NULL DEFAULT '0',
  `upvote` int NOT NULL,
  `comments` varchar(5000) NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `modifiedAt` datetime DEFAULT NULL,
  `questionAnswersId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `questionComments_users_idx` (`userId`),
  KEY `questionComments_questionAnswers_idx` (`questionAnswersId`),
  CONSTRAINT `questionComments_questionAnswers` FOREIGN KEY (`questionAnswersId`) REFERENCES `question_answers` (`id`),
  CONSTRAINT `questionComments_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_comments`
--

LOCK TABLES `question_comments` WRITE;
/*!40000 ALTER TABLE `question_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `questionName` varchar(1000) NOT NULL,
  `description` varchar(5000) NOT NULL,
  `views` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `modifiedAt` datetime DEFAULT NULL,
  `categoryId` int NOT NULL,
  `userId` int NOT NULL,
  `upvote` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `Questions_Categories_idx` (`categoryId`),
  CONSTRAINT `Questions_Categories` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`),
  CONSTRAINT `Questions_Users` FOREIGN KEY (`categoryId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_comments`
--

DROP TABLE IF EXISTS `review_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reviewId` int NOT NULL,
  `comment` varchar(2000) NOT NULL,
  `views` int NOT NULL DEFAULT '0',
  `upvote` int NOT NULL DEFAULT '0',
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviewComments_reviews_idx` (`reviewId`),
  KEY `reviewsComment_users_idx` (`userId`),
  CONSTRAINT `reviewComments_reviews` FOREIGN KEY (`reviewId`) REFERENCES `reviews` (`id`),
  CONSTRAINT `reviewsComment_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_comments`
--

LOCK TABLES `review_comments` WRITE;
/*!40000 ALTER TABLE `review_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_images`
--

DROP TABLE IF EXISTS `review_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imageLink` varchar(2000) NOT NULL,
  `reviewId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `modifiedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviewImages_reviews_idx` (`reviewId`),
  CONSTRAINT `reviewImages_reviews` FOREIGN KEY (`reviewId`) REFERENCES `reviews` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_images`
--

LOCK TABLES `review_images` WRITE;
/*!40000 ALTER TABLE `review_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_upvotes`
--

DROP TABLE IF EXISTS `review_upvotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_upvotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reviewId` int NOT NULL,
  `userid` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_upvotes_idx` (`reviewId`),
  KEY `review_upvotes_idx` (`userid`),
  CONSTRAINT `review_upvotes` FOREIGN KEY (`userid`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_upvotes` FOREIGN KEY (`reviewId`) REFERENCES `reviews` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_upvotes`
--

LOCK TABLES `review_upvotes` WRITE;
/*!40000 ALTER TABLE `review_upvotes` DISABLE KEYS */;
INSERT INTO `review_upvotes` VALUES (1,1,55);
/*!40000 ALTER TABLE `review_upvotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(5000) NOT NULL,
  `rate` int NOT NULL DEFAULT '0',
  `productId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL,
  `views` int NOT NULL DEFAULT '0',
  `rowStatus` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `ProductId_idx` (`productId`),
  KEY `UserId_idx` (`userId`),
  CONSTRAINT `Reviews_Products` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `Reviews_Users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'Gretest Product',5,1,55,'2021-03-28 13:59:38',NULL,3,1),(2,'Worted!!',5,1,55,'2021-03-28 14:12:13',NULL,0,1),(3,'Gretest Product',3,2,55,'2021-03-28 14:13:43',NULL,0,1);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'User','0000-00-00 00:00:00',NULL),(2,'Merchant','0000-00-00 00:00:00',NULL),(3,'Admin','0000-00-00 00:00:00',NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_forgotpassword`
--

DROP TABLE IF EXISTS `user_forgotpassword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_forgotpassword` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(60) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `status` varchar(1) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `expired_time` datetime NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL,
  `token` varchar(240) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_forgotpassword`
--

LOCK TABLES `user_forgotpassword` WRITE;
/*!40000 ALTER TABLE `user_forgotpassword` DISABLE KEYS */;
INSERT INTO `user_forgotpassword` VALUES (1,'test@yopmail.com','0','0000-00-00 00:00:00','2020-11-18 14:01:59',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAeW9wbWFpbC5jb20iLCJkZXN'),(2,'njicker@gmail.com','0','0000-00-00 00:00:00','2020-11-18 14:03:01',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGV'),(3,'njicker@gmail.com','0','2020-10-18 14:07:31','2020-11-18 14:06:05',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNTY4MzE2NSwiZXhwIjoxNjA1NzY5NTY1fQ.zMXq'),(4,'njicker@gmail.com','0','2020-11-19 14:13:04','2020-11-18 14:13:04',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNTY4MzU4NCwiZXhwIjoxNjA1NzY5OTg0fQ.HqS34611GtlFzwgjd3kdO77j-UfO9F4WDgW6y0DP6Tk'),(5,'lexy3@gmail.com','0','2020-11-29 17:51:36','2020-11-29 00:51:36',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxleHkzQGdtYWlsLmNvbSIsImRlc2MiOiJGb3Jnb3QgUGFzc3dvcmQiLCJpYXQiOjE2MDY1ODU4OTYsImV4cCI6MTYwNjY3MjI5Nn0.VDEq6nwCqjjEvMMCeTNBJbT0anYcz8RzXfPdaPIOdtI'),(6,'lexy3@gmail.com','0','2020-11-29 18:19:26','2020-11-29 01:19:26',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxleHkzQGdtYWlsLmNvbSIsImRlc2MiOiJGb3Jnb3QgUGFzc3dvcmQiLCJpYXQiOjE2MDY1ODc1NjYsImV4cCI6MTYwNjY3Mzk2Nn0.87T1mHdENm1FgOEmEelK5FU8ikpXawAy4bxfSQpmJ1k'),(7,'njicker@gmail.com','0','2020-12-04 08:05:23','2020-12-03 15:05:23',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNjk4MjcyMywiZXhwIjoxNjA3MDY5MTIzfQ.YIsp_EjKWKTiPl6TaeMWU7LqVCpIN7mZzkn7xRz81FE'),(8,'njicker@gmail.com','0','2020-12-06 14:42:12','2020-12-05 21:42:12',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNzE3OTMzMiwiZXhwIjoxNjA3MjY1NzMyfQ.v-ML9lK5hF6v5F1XbdAvGD7e1gePFZgd8BU1O7EixII'),(9,'njicker@gmail.com','0','2020-12-12 20:28:26','2020-12-11 20:28:26',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNzY5MzMwNiwiZXhwIjoxNjA3Nzc5NzA2fQ.0OwQIyC2BjH26WELu8Vwxc546wigXoFK_2Onj88V-D4'),(10,'njicker@gmail.com','0','2020-12-12 20:40:34','2020-12-11 20:40:35',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNzY5NDAzNCwiZXhwIjoxNjA3NzgwNDM0fQ.xjm6OiNcr3Emn6rga_qKg9IR8ViI1yEiBKMmz9m0rLY'),(11,'njicker@gmail.com','0','2020-12-12 20:40:46','2020-12-11 20:40:47',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNzY5NDA0NiwiZXhwIjoxNjA3NzgwNDQ2fQ.1QpVFyr4SS9OFIVJfZmSZYYvNiIsnkDqkQw_XfwaEag'),(12,'njicker@gmail.com','0','2020-12-12 20:42:18','2020-12-11 20:42:18',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNzY5NDEzOCwiZXhwIjoxNjA3NzgwNTM4fQ.Dcd_Dn81VaeDok3bbBeeNsvhjmHxW_AvBmWjms6lnzs'),(13,'njicker@gmail.com','0','2020-12-12 20:46:40','2020-12-11 20:46:40',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNzY5NDQwMCwiZXhwIjoxNjA3NzgwODAwfQ.wNpIXn0dp7y7SxMS5TgTInlg_XrlhUHhoXfGX2VP3U4'),(14,'njicker@gmail.com','0','2020-12-12 20:47:20','2020-12-11 20:47:21',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNzY5NDQ0MCwiZXhwIjoxNjA3NzgwODQwfQ.excAQoBpwpzw5A-q5WiH9Op6te95amLRkh70B8G04dw'),(15,'njicker@gmail.com','0','2020-12-12 20:48:51','2020-12-11 20:48:51',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYwNzY5NDUzMSwiZXhwIjoxNjA3NzgwOTMxfQ.31YqQ5s8NHzjUCxcgMtAtzcuq8T_T_h1zNi53R-JRVE'),(16,'louis_jimmy@yahoo.com','0','2020-12-24 13:24:21','2020-12-23 13:24:21',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxvdWlzX2ppbW15QHlhaG9vLmNvbSIsImRlc2MiOiJGb3Jnb3QgUGFzc3dvcmQiLCJpYXQiOjE2MDg3Mjk4NjEsImV4cCI6MTYwODgxNjI2MX0.JxqJFEf5u_0Ndk9EEWkHx8wZx_xskDg-ILh-3cOqb5s'),(17,'antares11181982@yahoo.com.sg','0','2021-01-15 03:34:32','2021-01-14 11:34:32',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFudGFyZXMxMTE4MTk4MkB5YWhvby5jb20uc2ciLCJkZXNjIjoiRm9yZ290IFBhc3N3b3JkIiwiaWF0IjoxNjEwNTk1MjcyLCJleHAiOjE2MTA2ODE2NzJ9.pc6wlgO9LqEZfHMflyJ0KyvmlQGB4YGpDctiNFsk2Xk'),(18,'obamama@kittiza.com','0','2021-01-15 14:09:27','2021-01-14 14:09:27',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9iYW1hbWFAa2l0dGl6YS5jb20iLCJkZXNjIjoiRm9yZ290IFBhc3N3b3JkIiwiaWF0IjoxNjEwNjMzMzY3LCJleHAiOjE2MTA3MTk3Njd9.JPDaVDavlA5YC75-WIgyNoYcG0ulhY9xywlMx0lvusA'),(19,'mac@billseo.com','0','2021-01-17 12:27:36','2021-01-16 12:27:36',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hY0BiaWxsc2VvLmNvbSIsImRlc2MiOiJGb3Jnb3QgUGFzc3dvcmQiLCJpYXQiOjE2MTA4MDAwNTYsImV4cCI6MTYxMDg4NjQ1Nn0.j-0bLr9X5WcNeJgLc9kHtdjtAeEQKZlFn5-cN6zpRFg'),(20,'ganwh@singnet.com.sg','0','2021-01-17 15:39:56','2021-01-16 15:39:56',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhbndoQHNpbmduZXQuY29tLnNnIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxMDgxMTU5NiwiZXhwIjoxNjEwODk3OTk2fQ.xgJW-VKYBzf7gznBMosob8aCli1QlV2cnpkJ91Qm6Js'),(21,'ganwh@singnet.com.sg','0','2021-01-17 15:41:10','2021-01-16 15:41:10',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhbndoQHNpbmduZXQuY29tLnNnIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxMDgxMTY3MCwiZXhwIjoxNjEwODk4MDcwfQ.M8pX_aJnqMu4I__pksREKOU2NjrKfCkzNGjcPIUMoUQ'),(22,'xuhong.gan@pito.com.sg','0','2021-01-18 06:38:55','2021-01-17 06:38:55',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inh1aG9uZy5nYW5AcGl0by5jb20uc2ciLCJkZXNjIjoiRm9yZ290IFBhc3N3b3JkIiwiaWF0IjoxNjEwODY1NTM1LCJleHAiOjE2MTA5NTE5MzV9.dl3U8NX5pcrFv5J5rQxdoQAmsc_mlNqfe2_2n6WZQC4'),(23,'yang_eric_82@yahoo.com.sg','0','2021-01-18 06:41:16','2021-01-17 06:41:16',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlhbmdfZXJpY184MkB5YWhvby5jb20uc2ciLCJkZXNjIjoiRm9yZ290IFBhc3N3b3JkIiwiaWF0IjoxNjEwODY1Njc2LCJleHAiOjE2MTA5NTIwNzZ9.Zal7n_KJJ7pcNBMHoyYfAVOt4UJb7YITb_gHLmRgtSY'),(24,'mac@mail.com','0','2021-01-27 05:22:59','2021-01-26 05:22:59',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hY0BtYWlsLmNvbSIsImRlc2MiOiJGb3Jnb3QgUGFzc3dvcmQiLCJpYXQiOjE2MTE2Mzg1NzksImV4cCI6MTYxMTcyNDk3OX0.As-icfbx64fHwcqZl89JsuY6IXVJw26ymDdf6RT1K5w'),(25,'andi.mlydi@gmail.com','0','2021-02-08 16:26:56','2021-02-07 16:26:56',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZGkubWx5ZGlAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxMjcxNTIxNiwiZXhwIjoxNjEyODAxNjE2fQ.P-H5hyA6-D4YnngiE_3_xBmYZ_filz7q2bSVO9ksgCM'),(26,'mac@kintils.com','0','2021-02-16 04:35:50','2021-02-15 04:35:50',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hY0BraW50aWxzLmNvbSIsImRlc2MiOiJGb3Jnb3QgUGFzc3dvcmQiLCJpYXQiOjE2MTMzNjM3NTAsImV4cCI6MTYxMzQ1MDE1MH0.0D-tB46Fvf_oSx7qe0imXpldi4xOmS1HKgylp1cUQrY'),(27,'antares11181982@yahoo.com.sg','0','2021-02-16 15:25:51','2021-02-15 15:25:51',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFudGFyZXMxMTE4MTk4MkB5YWhvby5jb20uc2ciLCJkZXNjIjoiRm9yZ290IFBhc3N3b3JkIiwiaWF0IjoxNjEzNDAyNzUxLCJleHAiOjE2MTM0ODkxNTF9.lGhORSG6AdZwZjtT8TeCyu94OTEuL1ba0Lw6JkRFc74'),(28,'louis_jimmy@yahoo.com','0','2021-02-21 09:57:32','2021-02-20 09:57:32',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxvdWlzX2ppbW15QHlhaG9vLmNvbSIsImRlc2MiOiJGb3Jnb3QgUGFzc3dvcmQiLCJpYXQiOjE2MTM4MTUwNTIsImV4cCI6MTYxMzkwMTQ1Mn0.z2Bd7Vhj_u0RozHWBsrOVXGEtZonCoGVY6aYzC8SMRY'),(29,'ganwh@singnet.com.sg','0','2021-02-22 06:45:10','2021-02-21 06:45:10',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhbndoQHNpbmduZXQuY29tLnNnIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxMzg4OTkxMCwiZXhwIjoxNjEzOTc2MzEwfQ.M2pkQpjsRyFPjeqnyKapwov3xnDAwT25sOxZ_M0qf9I'),(30,'antares11181982@yahoo.com.sg','0','2021-02-22 06:46:28','2021-02-21 06:46:28',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFudGFyZXMxMTE4MTk4MkB5YWhvby5jb20uc2ciLCJkZXNjIjoiRm9yZ290IFBhc3N3b3JkIiwiaWF0IjoxNjEzODg5OTg4LCJleHAiOjE2MTM5NzYzODh9.jKW6ETGVQG56JUyVs-Bd0QA1fnDHwDmA3jN5TUwml7k'),(31,'njicker@gmail.com','0','2021-03-07 05:16:05','2021-03-06 05:16:05',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5qaWNrZXJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxNTAwNzc2NSwiZXhwIjoxNjE1MDk0MTY1fQ.xa9zH5cagIa5YYvqWSKyUZQdqjO0jHeVgNWWvlKRi-8'),(32,'mac@mixalo.com','0','2021-03-09 14:31:54','2021-03-08 14:31:54',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hY0BtaXhhbG8uY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxNTIxMzkxNCwiZXhwIjoxNjE1MzAwMzE0fQ.fUO26KaCUYYCn7ghTob2tPe3c1KT932sjmFPuaXi7ig'),(33,'nandolim52@gmail.com','0','2021-03-09 14:48:49','2021-03-08 14:48:49',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hbmRvbGltNTJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxNTIxNDkyOSwiZXhwIjoxNjE1MzAxMzI5fQ.PjemSe8hYSBCvxq7lTqZRfELODmsC_-j5_G8L4Q1MxA'),(34,'ganwh@singnet.com.sg','0','2021-03-09 14:52:36','2021-03-08 14:52:36',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdhbndoQHNpbmduZXQuY29tLnNnIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxNTIxNTE1NiwiZXhwIjoxNjE1MzAxNTU2fQ.521QMRnRpKgIW1SBDwY8MDQ4dXqouPJdKQA_QcfJ3eY'),(35,'nandolim52@gmail.com','0','2021-03-16 06:55:58','2021-03-15 06:55:58',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hbmRvbGltNTJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxNTc5MTM1OCwiZXhwIjoxNjE1ODc3NzU4fQ.IpOiAd8zPGMKmi34aFM7I7S9DDfw07Y-xH91ML9gDmg'),(36,'me@nurulhidayat.com','0','2021-03-16 12:17:41','2021-03-15 12:17:41',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lQG51cnVsaGlkYXlhdC5jb20iLCJkZXNjIjoiRm9yZ290IFBhc3N3b3JkIiwiaWF0IjoxNjE1ODEwNjYxLCJleHAiOjE2MTU4OTcwNjF9.hSZwQy3sfZVJqYmTHHC0yaydJ7CAASjDcWjVtRcIZnw'),(37,'nandolim52@gmail.com','0','2021-03-16 12:48:11','2021-03-15 12:48:11',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hbmRvbGltNTJAZ21haWwuY29tIiwiZGVzYyI6IkZvcmdvdCBQYXNzd29yZCIsImlhdCI6MTYxNTgxMjQ5MSwiZXhwIjoxNjE1ODk4ODkxfQ.iYLjYMUbiasvVS75-h4uJgWOvAY7miP9DkDIb1sPd1c');
/*!40000 ALTER TABLE `user_forgotpassword` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_token_notif`
--

DROP TABLE IF EXISTS `user_token_notif`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_token_notif` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type_device` varchar(20) NOT NULL,
  `token` varchar(300) NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_token_notif`
--

LOCK TABLES `user_token_notif` WRITE;
/*!40000 ALTER TABLE `user_token_notif` DISABLE KEYS */;
INSERT INTO `user_token_notif` VALUES (1,29,'android','dLomIgDpTaGt6_q6nsyIin:APA91bFaJvsBTU1nmyPjyp3EDvnnuqbnsxXCkPRyRIP4nKs_J6IboOxJQ7Fi_9nY9nure47r2a2yZJBi7Yd3IXOpg1K5AGKc-T1DDmZetl_wAMVBPSuxzEQ4HaMkfvIWl1CAsp2mNjHA','2021-01-06 20:44:32'),(3,9,'android','f5HdDGbeTgGpxgJn91-CW6:APA91bGkecoBqRox9zVUHOev1noaeN2BEQIkNVpQqU9hFzK-RUXj67KMfy24VHEPdAU1Uqdm9Mf0G1VucDC9MAeBkM6rPcSjeEXIpv1AqVBcGnBGNyhCx1KQVNxiMkgYMHNjACRrA8v7','2021-01-06 22:33:04'),(4,9,'android','caBRAnw1RAKWxKid6W35MA:APA91bEUIJ5-nSujk9je-KHFr017NcsU_G2oUs6fJKoQ4zRxwb__zBrVfGOg-4RJIfaqTnMlZMAt3_8y9mtVNJ4d1ZZT-OfpnRVXOpr1Pa8iMj8-q3JhYnRgXwyV9oenEgY1OrDfiVZj','2021-01-06 23:00:00'),(5,9,'android','cBrJaUooTjmX-SxL2IauVN:APA91bGnl4q2w5LTays-H6lEgO4o--F3nmnJPz1mRWAenx3ZI2BGCyCSZ9keoR0B9seRZ_6T14X56bLAF-N0HuLmNZrgkFrQW2bcZ6AirYjcovbEn8WOrVdFvJXyz3_KiPp4OCJvHV0_','2021-01-06 23:04:12'),(10,16,'android','etrnKZdwSUegYU_QGLWx62:APA91bHSCa_rsX6dI-cgAYcsMEYrL1MmlLD2q0CAxIVx5dUhPtHjyVLR8afGARAeyln0sPAOeGb7lK8To5FDybY-_zFggsicS1xzDFn7q9wGZv475pQekATZMvQMd6bMho224AJrbmyK','2021-01-07 10:39:55'),(13,29,'android','eOxe8N_MR0Gk9XKvDt3vLD:APA91bEG1-g1aQKI1JdzyBjPOeMZ9rKzTqslf7ZeXes4dpdWO2CJPL-Rqrt9IlnzWLcleW5xXJRGSh4pgBRfuvXFdEWND8G6kjfjGfMhjFtINWz6ljJCPTQ8D-G3sHcMyIFfqyRm4Kyk','2021-01-07 11:39:19'),(15,20,'android','eOxe8N_MR0Gk9XKvDt3vLD:APA91bEG1-g1aQKI1JdzyBjPOeMZ9rKzTqslf7ZeXes4dpdWO2CJPL-Rqrt9IlnzWLcleW5xXJRGSh4pgBRfuvXFdEWND8G6kjfjGfMhjFtINWz6ljJCPTQ8D-G3sHcMyIFfqyRm4Kyk','2021-01-07 22:09:37'),(16,32,'android','eOxe8N_MR0Gk9XKvDt3vLD:APA91bEG1-g1aQKI1JdzyBjPOeMZ9rKzTqslf7ZeXes4dpdWO2CJPL-Rqrt9IlnzWLcleW5xXJRGSh4pgBRfuvXFdEWND8G6kjfjGfMhjFtINWz6ljJCPTQ8D-G3sHcMyIFfqyRm4Kyk','2021-01-07 22:13:20'),(17,1,'android','eOxe8N_MR0Gk9XKvDt3vLD:APA91bEG1-g1aQKI1JdzyBjPOeMZ9rKzTqslf7ZeXes4dpdWO2CJPL-Rqrt9IlnzWLcleW5xXJRGSh4pgBRfuvXFdEWND8G6kjfjGfMhjFtINWz6ljJCPTQ8D-G3sHcMyIFfqyRm4Kyk','2021-01-07 22:27:55'),(22,1,'undefined','undefined','2021-01-08 13:55:16'),(23,17,'undefined','undefined','2021-01-08 22:48:22'),(27,16,'ios','42d4a4fb8b9b53846ebe5f72610d2a7cf2fa11aa245be9a4c27c0df27981dee7','2021-01-09 00:43:19'),(31,17,'android','eXEhDj4cSHSxTG9BxjKDKD:APA91bGuRs7di8xH73RNjGhIcii2z7VmDeHMmdseGpf82Q7GMYkHmrEPU3p1gEVt_ykdspxSZ9bGKPznWuP-QSQsaVjjAJyX15Vt9mjS9l-7GG-s5Art70Z7Rt5qSWXuxMIZue0oFrLP','2021-01-10 00:15:54'),(33,1,'android','dQbA9qLnRz6MexbyZzyFXR:APA91bGMAPBlJN09IYPlL2th0257SUCNd2lj2qCUDmpOJmBKQ2Htb6aWAgKd4Sh5-s3KzFsLDYfsa-LsZiYRkHOyScEic-5vL-Ujb7ECydwx50WHo4KRdZRPj_0Ri3amLHBf5BJJh94A','2021-01-10 10:22:15'),(34,33,'android','fnXDeqbRRaOWExUtjoi3-_:APA91bGoZDnVE31rYljEjMaAGbcm-Kn2AGOopX84WCr6ao_XPVCi3A4kQOIuvo7HM8qzkd6i06M3YsQ384HHRtQNTzxJ3sGbuKRx85-NxwxBi2gKW54eyhMHv3nyxYCQzush76ZmGpRM','2021-01-10 11:11:12'),(37,6,'undefined','undefined','2021-01-11 12:03:47'),(41,20,'android','fnXDeqbRRaOWExUtjoi3-_:APA91bGoZDnVE31rYljEjMaAGbcm-Kn2AGOopX84WCr6ao_XPVCi3A4kQOIuvo7HM8qzkd6i06M3YsQ384HHRtQNTzxJ3sGbuKRx85-NxwxBi2gKW54eyhMHv3nyxYCQzush76ZmGpRM','2021-01-12 17:02:46'),(44,31,'undefined','undefined','2021-01-14 09:03:13'),(47,38,'android','deyuMQKeT7-Pv7UTKIcUSW:APA91bHj2d7jLz6g43IMCsYsjLuTiDldp9bQZUIpAAHHSlA-eFSvl0nZdCM2az7rSNbuuOEy5_AvyiiJraN1_5_Aw9JxIIE4R7IrawtemGigwrSdnR8SVF5KJZaf3jkoTED_wCoVIi9B','2021-01-14 14:09:12'),(48,37,'android','deyuMQKeT7-Pv7UTKIcUSW:APA91bHj2d7jLz6g43IMCsYsjLuTiDldp9bQZUIpAAHHSlA-eFSvl0nZdCM2az7rSNbuuOEy5_AvyiiJraN1_5_Aw9JxIIE4R7IrawtemGigwrSdnR8SVF5KJZaf3jkoTED_wCoVIi9B','2021-01-14 14:10:53'),(49,39,'android','fkbX1vCVTi-rPSW3mC1GNi:APA91bFoDzLMpqmpFk8M_BU1OjescHlO3oQvUbW1KHZycTgJPNnEIzJhfb_gvUpng_bjTHLcbWS8BPqHaurrnsWLd1cUpRg8OSIfeBsJWmghclP-FtaBn_LTKTl8613Rh9NiyL_JxfDm','2021-01-14 14:51:33'),(51,12,'undefined','undefined','2021-01-16 10:25:16'),(53,40,'android','deyuMQKeT7-Pv7UTKIcUSW:APA91bHj2d7jLz6g43IMCsYsjLuTiDldp9bQZUIpAAHHSlA-eFSvl0nZdCM2az7rSNbuuOEy5_AvyiiJraN1_5_Aw9JxIIE4R7IrawtemGigwrSdnR8SVF5KJZaf3jkoTED_wCoVIi9B','2021-01-16 13:34:57'),(56,41,'android','fMKISH7dTHCyVooyIus_in:APA91bFUMBGZbS5kMpzCEFaIivmwruv_dO2JaANT8_dJS89qmvKiTTp8ryF-MsiPvzqGd8lJZ4dkU-5PF-IHGedqcRlNJg3aOmUyPr7CT7G54XqOvzBDzqnxFFGhywTotcwD9av5Qfym','2021-01-17 06:36:57'),(57,18,'android','dYMIt2MFSg2f62-n2J5cJm:APA91bEdkdD7NYJXnnk2vWDVkD95wf47p8ebtMwpycMlH63RFKqCdfLSbm3v_nZGFSLRNACbkmQDWGJyHQGr2WqnnamlWOlnrTn5p3CrVNHQqTR4l8JMFojgkJakbeO09MZT_830AVin','2021-01-17 06:44:06'),(60,12,'ios','60ac0a73562d708c5c9283802140a16058dbc734cb880f3bc48238e6474bb542','2021-01-20 03:28:52'),(62,17,'android','fMKISH7dTHCyVooyIus_in:APA91bFUMBGZbS5kMpzCEFaIivmwruv_dO2JaANT8_dJS89qmvKiTTp8ryF-MsiPvzqGd8lJZ4dkU-5PF-IHGedqcRlNJg3aOmUyPr7CT7G54XqOvzBDzqnxFFGhywTotcwD9av5Qfym','2021-01-20 15:37:29'),(64,20,'android','deyuMQKeT7-Pv7UTKIcUSW:APA91bERWnc_kOsqlkxRvqtkt5oDMWErTWSN81qs2fFMx-hgmdNCO3EYskmApUjaL9DYvEUUAjyJrmafEIGsLOv8X5sKA5BWP_s8vSiK990gt_tdFLcz9Ai5neWQ4ayzu5FPuECS22lt','2021-01-23 06:30:55'),(65,35,'android','dYMIt2MFSg2f62-n2J5cJm:APA91bEdkdD7NYJXnnk2vWDVkD95wf47p8ebtMwpycMlH63RFKqCdfLSbm3v_nZGFSLRNACbkmQDWGJyHQGr2WqnnamlWOlnrTn5p3CrVNHQqTR4l8JMFojgkJakbeO09MZT_830AVin','2021-01-24 06:39:49'),(66,17,'android','fMKISH7dTHCyVooyIus_in:APA91bHzhFhaqEvSgW9UJCqDZLsxjfcfNu8PMfQniUMTyF9GXDdhPLbpqcAm5DB446CxbEXv8oaJOwelNocq6C3sGbauIxvaKzk19hM0EOXNsb3CSKjIMdAc84-G2GDArM_mj7J3-V2V','2021-01-24 06:40:12'),(68,41,'android','fIPKZzr1Rx6LGapfGmbuR1:APA91bFq5VMwvI30urADeG40DHRev6VBl_T9SPFGX19Frsv_Rsu6NmqDAIoPNU9K-P_nyDYXa3G9eAbmFjgeAWKFmmd9XJyoVKq27W-IJF6iF2PQp7lxgdudib5b8C-7_M6270xf7Nne','2021-01-24 11:42:16'),(69,34,'android','deyuMQKeT7-Pv7UTKIcUSW:APA91bERWnc_kOsqlkxRvqtkt5oDMWErTWSN81qs2fFMx-hgmdNCO3EYskmApUjaL9DYvEUUAjyJrmafEIGsLOv8X5sKA5BWP_s8vSiK990gt_tdFLcz9Ai5neWQ4ayzu5FPuECS22lt','2021-01-24 12:40:18'),(73,44,'android','e6JNHD7qTpCBVfj_uw5rTy:APA91bEhfwrkwVbAdPy9PlMJBlh_gWxjYzLS3A6sPfe2GWWlasQjBDj68gD4hVDlKP6Y35im4hgFQE_FTDUHcpZtMWl2g5x_wYxLVcAxcxqGcbBudEnwwIiqpD6x--SzLQ9KZitrJHau','2021-02-02 14:32:16'),(74,14,'ios','','2021-02-05 17:44:11'),(75,12,'android','doz3PKHDScqCckvAqcaQAB:APA91bH5uuqmK1Klqwyd_6qMpqi9O1hGL7gN5IX_YyO4ok_qgpSiriYLbzZH9nfDAlTlAUKhBEnKHKWh8-iuciHHQ7znB5WeNL4QadVuR0DR8XdngqSb__z31xs7PfHTRPZc6-W73H30','2021-02-07 12:28:20'),(77,5,'ios','a9c2368f20a7737ed4e3531ed07c9aa1b408d8b4d2087a1c42012eeb1d360d32','2021-02-07 12:41:55'),(80,29,'android','deyuMQKeT7-Pv7UTKIcUSW:APA91bGnXz0VI36NOIkvJUd1WlQZrXbbXkN5l5NcXS15B3seKIlj2RB18Ly-es-cVt57exYjREdZLtBuPsKPcyztQP8PWLvt65p63_G364fA1mzS_o54az9inHjsQz5butlUaDZ69Vx6','2021-02-07 12:56:42'),(82,45,'android','doz3PKHDScqCckvAqcaQAB:APA91bH5uuqmK1Klqwyd_6qMpqi9O1hGL7gN5IX_YyO4ok_qgpSiriYLbzZH9nfDAlTlAUKhBEnKHKWh8-iuciHHQ7znB5WeNL4QadVuR0DR8XdngqSb__z31xs7PfHTRPZc6-W73H30','2021-02-07 16:50:56'),(83,46,'android','doz3PKHDScqCckvAqcaQAB:APA91bH5uuqmK1Klqwyd_6qMpqi9O1hGL7gN5IX_YyO4ok_qgpSiriYLbzZH9nfDAlTlAUKhBEnKHKWh8-iuciHHQ7znB5WeNL4QadVuR0DR8XdngqSb__z31xs7PfHTRPZc6-W73H30','2021-02-07 16:52:27'),(88,49,'android','doz3PKHDScqCckvAqcaQAB:APA91bH5uuqmK1Klqwyd_6qMpqi9O1hGL7gN5IX_YyO4ok_qgpSiriYLbzZH9nfDAlTlAUKhBEnKHKWh8-iuciHHQ7znB5WeNL4QadVuR0DR8XdngqSb__z31xs7PfHTRPZc6-W73H30','2021-02-09 04:08:36'),(102,17,'android','eihcd91kQemVDK5q_xQ3rL:APA91bFowKjdVtyZIM9EvYSf_1DIX9Uf2QeKrTDrJMkrLGCiWc-2mHSp221soXn9jsFyJmqFzlWvgiH3W8bR6X7JZjKhiAHtt34fJ4-bCZ4bfvl_gAS01OyVhvcLTwDQSboRAPOXtvUb','2021-02-15 15:07:32'),(104,9,'android','doz3PKHDScqCckvAqcaQAB:APA91bH5uuqmK1Klqwyd_6qMpqi9O1hGL7gN5IX_YyO4ok_qgpSiriYLbzZH9nfDAlTlAUKhBEnKHKWh8-iuciHHQ7znB5WeNL4QadVuR0DR8XdngqSb__z31xs7PfHTRPZc6-W73H30','2021-02-20 04:52:06'),(106,9,'android','cUDu3OE-TcWPUBdn8lIIU4:APA91bH-4J5vqBzGBKOKxYCAcu5U4HGAO907svJ_MVaPilMDq22TAYGWCrwfRGx6shcHaRNm2KXmoLuK1UhgHCElyL5Upvv0LFRmcrNAkxPTJw_cnKEtCbumKSFhAGdc54W-cklOyOSr','2021-02-20 06:01:15'),(109,50,'android','dcCD1yUCQgiRYPY0w0s69I:APA91bHuZ8JOQf34TBXTWWBKbHC-K41IIojcLmBheOYz4vggkAxiUxmlLDVsqV3W7XZu6tiGnxrqbTX4Koj9I8AsixG_xFItjE4_EQpEatvDOQ62LAn6Kj3ie0x3eQPiFpIgcY5KJn5a','2021-02-20 10:13:39'),(112,50,'android','dW6SY503RLuJgd-4-4O3Ye:APA91bHyMtuNw3TBHvCmwucvxfBZcG-j-59uWKwOOteG5RyRAhgfm2S4XSkEtsBs9fYK8G8-BTo1xFVJuhWhc7GzDSbQclU6AqIGN5FjBxNXm5OfPJWQcSaHt2jSS0aKdOW1SvXh0m29','2021-03-07 04:53:50'),(114,51,'android','dW6SY503RLuJgd-4-4O3Ye:APA91bHyMtuNw3TBHvCmwucvxfBZcG-j-59uWKwOOteG5RyRAhgfm2S4XSkEtsBs9fYK8G8-BTo1xFVJuhWhc7GzDSbQclU6AqIGN5FjBxNXm5OfPJWQcSaHt2jSS0aKdOW1SvXh0m29','2021-03-08 14:31:46'),(116,17,'android','e-teBwlsT8-EctmxVMtyqp:APA91bGAwpKqoRnGpglHRW4QVGIWqxFLXbT1IBRxwRiTwK9xBj5G2M4zVie8NG4bxM7XcT6x2C2GYBU5ExTmTa-9eUBjx7dCgCTKEXXK9w1R_ymXRTloj7Vg2YMMYHkjtVKvmN-vlmaN','2021-03-08 14:49:44'),(118,42,'ios','60ac0a73562d708c5c9283802140a16058dbc734cb880f3bc48238e6474bb542','2021-03-11 07:36:49'),(119,5,'ios','','2021-03-13 05:33:40'),(120,29,'android','dW6SY503RLuJgd-4-4O3Ye:APA91bHyMtuNw3TBHvCmwucvxfBZcG-j-59uWKwOOteG5RyRAhgfm2S4XSkEtsBs9fYK8G8-BTo1xFVJuhWhc7GzDSbQclU6AqIGN5FjBxNXm5OfPJWQcSaHt2jSS0aKdOW1SvXh0m29','2021-03-15 03:49:58'),(121,42,'ios','initesktokenAD','2021-03-20 08:07:10'),(122,52,'ios','initesktokenIOS','2021-03-20 20:45:11'),(123,52,'undefined','undefined','2021-03-20 20:47:00'),(124,53,'undefined','undefined','2021-03-20 22:20:21'),(125,54,'ios','initesktokenIOS','2021-03-20 22:20:44'),(126,54,'undefined','undefined','2021-03-20 22:20:54'),(127,55,'ios','initesktokenIOS','2021-03-28 02:06:55'),(128,55,'undefined','undefined','2021-03-28 02:07:36');
/*!40000 ALTER TABLE `user_token_notif` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(60) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(60) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `source` varchar(45) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `isactive` tinyint(1) NOT NULL DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (53,'fauzi PITO','$2b$10$.FUd4OxacTGmPc1kM2Ul2OPcfGQZUUgMOH6Qhr4/xTRX1CQ/soFNe','vb.simamora@yopmail.com','App',1,NULL,'2021-03-20 22:17:37',NULL),(54,'fauzi PITO','$2b$10$rqLz.TmZpFLcAanshthn4./GhuL67jCDPulIMumCXkBXlxPpamqXi','test.test@yopmail.com','App',1,'2021-03-20 22:20:54','2021-03-20 22:20:44',NULL),(55,'fauzi PITO','$2b$10$peV6YlNpjXDrUzccFffuWOl8y9uA3PB7Bq/7hVdQ.NsBXIQ8T3DL2','fauzi@pito.com.sg','App',1,'2021-03-28 13:06:08','2021-03-28 02:06:54',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_details`
--

DROP TABLE IF EXISTS `users_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_details` (
  `userId` int NOT NULL,
  `img_avatar` varchar(160) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `isMute` int DEFAULT '0',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_details`
--

LOCK TABLES `users_details` WRITE;
/*!40000 ALTER TABLE `users_details` DISABLE KEYS */;
INSERT INTO `users_details` VALUES (1,'https://api.pito.com.sg/pic/user1_1610562598900.jpg',0),(4,'https://api.pito.com.sg/pic/user5_1608392744099.jpg',0),(5,'',1),(6,'https://sribulancer-production-sg.s3.ap-southeast-1.amazonaws.com/assets/media/freelancer_member/58a043126372752fa8000000/large_13a5c17378.png',0),(7,'',0),(8,'',0),(9,'https://api.pito.com.sg/pic/user9_1608392354893.jpg',1),(10,'',0),(11,'',0),(12,'https://www.nurulhidayat.com/assets/favicon.png',0),(13,'null',0),(14,'https://lh6.googleusercontent.com/-6lDJq02voV8/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucleQ_U5DX9zzsf06EE6fQ21bXtzbQ/s40/photo.jpg',0),(15,'null',0),(16,'https://api.pito.com.sg/pic/user5_1608392744099.jpg',0),(17,'',0),(18,'',1),(19,'',0),(20,'',0),(21,'',0),(22,'null',0),(23,'',0),(24,'https://api.pito.com.sg/pic/user5_1608392744099.jpg',0),(25,'https://lh3.googleusercontent.com/-K6yvYQQKR-Q/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuck8F5lY3d4T83Xb7xi_bFefAoEV3g/s40/photo.jpg',0),(26,'',0),(27,'https://lh3.googleusercontent.com/a-/AOh14GhuSDYev5SDBfDKB3Vke4rXMHYrK0PPdFt0yxMs=s40',0),(28,'',0),(29,'',0),(30,'',0),(32,'',0),(33,'',0),(34,'',0),(35,'https://api.pito.com.sg/pic/user35_1610635063940.jpg',0),(36,'',0),(37,'',0),(38,'',0),(39,'',0),(40,'',0),(41,'',0),(42,'https://api.pito.com.sg/pic/user42_1611113448283.jpg',0),(43,'https://graph.facebook.com/10158183727503732/picture?type=large',0),(44,'',0),(45,'',0),(46,'',0),(47,'',0),(48,'',0),(49,'',0),(50,'https://api.pito.com.sg/pic/user50_1613363591351.jpg',0),(51,'',0),(52,'',0),(54,'',0),(55,'',0);
/*!40000 ALTER TABLE `users_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_roles`
--

DROP TABLE IF EXISTS `users_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_roles` (
  `userId` int NOT NULL,
  `roleId` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`userId`,`roleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_roles`
--

LOCK TABLES `users_roles` WRITE;
/*!40000 ALTER TABLE `users_roles` DISABLE KEYS */;
INSERT INTO `users_roles` VALUES (1,1,'2020-11-20 16:54:54',NULL),(1,2,'2020-11-21 08:19:09',NULL),(1,3,'2021-01-07 23:55:38',NULL),(2,1,'2020-11-21 11:42:01',NULL),(2,2,'2020-11-22 02:32:21',NULL),(3,1,'2020-11-21 11:54:45',NULL),(4,1,'2020-11-21 23:16:45',NULL),(5,1,'2020-11-21 23:17:55',NULL),(5,2,'2020-11-22 17:39:09',NULL),(6,1,'2020-11-22 03:04:49',NULL),(6,2,'2020-11-22 03:14:18',NULL),(7,1,'2020-11-22 14:42:33',NULL),(7,2,'2020-11-22 14:43:02',NULL),(8,1,'2020-11-23 18:36:33',NULL),(9,1,'2020-11-28 11:27:46',NULL),(9,2,'2021-01-04 16:09:35',NULL),(10,1,'2020-11-30 08:46:36',NULL),(11,1,'2020-11-30 09:22:48',NULL),(12,2,'2020-12-13 22:32:02',NULL),(13,1,'2020-12-06 20:48:06',NULL),(14,1,'2020-12-15 15:45:39',NULL),(15,1,'2020-12-18 15:02:20',NULL),(16,1,'2020-12-18 17:00:24',NULL),(17,1,'2020-12-20 08:07:10',NULL),(17,2,'2021-01-16 15:38:30',NULL),(18,1,'2020-12-20 08:25:05',NULL),(19,1,'2020-12-22 04:34:32',NULL),(20,1,'2020-12-23 12:28:17',NULL),(20,2,'2020-12-23 12:29:31',NULL),(21,1,'2020-12-23 12:31:05',NULL),(21,3,'2020-12-23 12:31:43',NULL),(22,1,'2020-12-29 16:48:36',NULL),(23,1,'2020-12-30 03:33:05',NULL),(24,1,'2020-12-30 03:34:19',NULL),(25,1,'2020-12-30 14:40:08',NULL),(26,1,'2021-01-02 07:41:42',NULL),(27,1,'2021-01-02 07:44:45',NULL),(28,1,'2021-01-04 16:22:51',NULL),(28,2,'2021-01-04 16:23:14',NULL),(29,1,'2021-01-05 07:45:57',NULL),(29,2,'2021-02-15 14:47:31',NULL),(30,1,'2021-01-05 14:31:45',NULL),(31,1,'2021-01-06 07:55:55',NULL),(32,1,'2021-01-07 22:13:20',NULL),(33,1,'2021-01-10 11:11:12',NULL),(34,1,'2021-01-12 15:54:25',NULL),(35,1,'2021-01-14 11:41:27',NULL),(35,2,'2021-01-14 11:46:32',NULL),(36,1,'2021-01-14 12:17:39',NULL),(37,1,'2021-01-14 14:07:19',NULL),(37,2,'2021-01-14 14:42:15',NULL),(38,1,'2021-01-14 14:09:12',NULL),(39,1,'2021-01-14 14:51:33',NULL),(40,1,'2021-01-16 12:27:00',NULL),(41,1,'2021-01-17 06:36:56',NULL),(41,2,'2021-01-17 07:37:16',NULL),(42,1,'2021-01-20 03:29:09',NULL),(43,1,'2021-01-26 13:22:47',NULL),(44,1,'2021-02-02 14:32:16',NULL),(44,2,'2021-02-02 14:34:19',NULL),(45,1,'2021-02-07 16:50:56',NULL),(46,1,'2021-02-07 16:52:27',NULL),(47,1,'2021-02-07 16:59:29',NULL),(48,1,'2021-02-07 17:00:40',NULL),(49,1,'2021-02-09 04:08:36',NULL),(50,1,'2021-02-15 04:22:33',NULL),(50,2,'2021-02-15 04:23:22',NULL),(51,1,'2021-03-08 14:31:46',NULL),(52,1,'2021-03-20 20:45:11',NULL),(54,1,'2021-03-20 22:20:44',NULL),(55,1,'2021-03-28 02:06:55',NULL);
/*!40000 ALTER TABLE `users_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-03-28 18:30:55

-- phpMyAdmin SQL Dump
-- version 3.4.10.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Nov 07, 2012 at 08:52 PM
-- Server version: 5.5.20
-- PHP Version: 5.3.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `flame`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `user` varchar(11) NOT NULL COMMENT 'in-game name',
  `x` int(11) NOT NULL DEFAULT '0' COMMENT 'last recorded x position',
  `y` int(11) NOT NULL DEFAULT '0' COMMENT 'last recorded y position',
  `facing` varchar(5) NOT NULL DEFAULT 'down' COMMENT 'direction player faces',
  `skin` varchar(20) NOT NULL,
  `state` varchar(20) NOT NULL,
  `map` varchar(30) NOT NULL,
  PRIMARY KEY (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` VALUES('Jake', 416, 2960, 'up', 'boy', 'idle', 'RsWorld');
INSERT INTO `users` VALUES('Joncom', 416, 2960, 'up', 'girl', 'idle', 'RsWorld');
INSERT INTO `users` VALUES('kitti', 256, 224, 'right', 'boy', 'idle', 'RsBattleTower');
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 20, 2026 at 03:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `expoferiascr`
--

-- --------------------------------------------------------

--
-- Table structure for table `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'aprobado',
  `razon_rechazo` text DEFAULT NULL,
  `fecha_envio_revision` datetime DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `ubicacion` text DEFAULT NULL,
  `imagen_portada` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `horario_imagen` text DEFAULT NULL,
  `mapa_embed` text DEFAULT NULL,
  `mapa_waze_embed` text DEFAULT NULL,
  `tipo_venta` varchar(20) DEFAULT 'taquilla',
  `url_venta_online` text DEFAULT NULL,
  `color_primario` varchar(7) DEFAULT '#8b5a2b',
  `color_secundario` varchar(7) DEFAULT '#d4a373',
  `color_fondo` varchar(7) DEFAULT '#f4e4c1',
  `color_texto` varchar(7) DEFAULT '#2c1a0e',
  `color_hero_overlay` varchar(30) DEFAULT 'rgba(62,42,31,0.7)',
  `color_titulo_hero` varchar(7) DEFAULT '#FFFFFF',
  `color_descripcion_hero` varchar(7) DEFAULT '#FFFFFF',
  `color_fondo_fechas` varchar(7) DEFAULT '#d4a373',
  `color_texto_fechas` varchar(7) DEFAULT '#8b5a2b',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `color_titulo_seccion` varchar(7) DEFAULT '#2c1a0e',
  `provincia` varchar(50) DEFAULT NULL,
  `color_menu_fondo` varchar(30) DEFAULT '#ffffff',
  `color_menu_texto` varchar(30) DEFAULT '#ffffff',
  `color_menu_fondo_hover` varchar(30) DEFAULT NULL,
  `color_menu_texto_hover` varchar(30) DEFAULT NULL,
  `color_fondo_contacto` varchar(7) DEFAULT '#f4e4c1',
  `color_texto_contacto` varchar(7) DEFAULT '#2c1a0e',
  `color_enlace_contacto` varchar(7) DEFAULT '#8b5a2b',
  `color_fondo_footer` varchar(7) DEFAULT '#8b5a2b',
  `color_texto_footer` varchar(7) DEFAULT '#ffffff',
  `color_titulo_h3` varchar(7) DEFAULT '#2c1a0e',
  `color_expositor_header` varchar(20) DEFAULT '#000000',
  `borrador_cambios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`borrador_cambios`)),
  `color_buscador_expositores` varchar(7) DEFAULT '#ffffff',
  `fecha_aprobacion` datetime DEFAULT NULL,
  `fecha_rechazo` datetime DEFAULT NULL,
  `color_borde_buscador_expositores` varchar(20) DEFAULT '#eee',
  `color_card_fondo` varchar(20) DEFAULT '#ffffff',
  `color_card_borde` varchar(20) DEFAULT '#f0f0f0',
  `color_rubro_fondo` varchar(20) DEFAULT '#f0f0f0',
  `color_rubro_texto` varchar(20) DEFAULT '#000000',
  `color_buscador_fondo` varchar(20) DEFAULT '#ffffff',
  `color_buscador_borde` varchar(20) DEFAULT '#eeeeee',
  `color_btn_ver_mas` varchar(20) DEFAULT '#C8102E',
  `color_fondo_share` varchar(30) DEFAULT 'rgba(255, 255, 255, 0.5)',
  `color_texto_share` varchar(20) DEFAULT '#2c1a0e',
  `es_en_vivo` tinyint(4) DEFAULT 0,
  `url_en_vivo` text DEFAULT NULL,
  `color_descripcion_texto` varchar(20) DEFAULT '#2c1a0e',
  `tiene_expositores` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `eventos`
--

INSERT INTO `eventos` (`id`, `usuario_id`, `estado`, `razon_rechazo`, `fecha_envio_revision`, `slug`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `ubicacion`, `imagen_portada`, `activo`, `horario_imagen`, `mapa_embed`, `mapa_waze_embed`, `tipo_venta`, `url_venta_online`, `color_primario`, `color_secundario`, `color_fondo`, `color_texto`, `color_hero_overlay`, `color_titulo_hero`, `color_descripcion_hero`, `color_fondo_fechas`, `color_texto_fechas`, `created_at`, `updated_at`, `color_titulo_seccion`, `provincia`, `color_menu_fondo`, `color_menu_texto`, `color_menu_fondo_hover`, `color_menu_texto_hover`, `color_fondo_contacto`, `color_texto_contacto`, `color_enlace_contacto`, `color_fondo_footer`, `color_texto_footer`, `color_titulo_h3`, `color_expositor_header`, `borrador_cambios`, `color_buscador_expositores`, `fecha_aprobacion`, `fecha_rechazo`, `color_borde_buscador_expositores`, `color_card_fondo`, `color_card_borde`, `color_rubro_fondo`, `color_rubro_texto`, `color_buscador_fondo`, `color_buscador_borde`, `color_btn_ver_mas`, `color_fondo_share`, `color_texto_share`, `es_en_vivo`, `url_en_vivo`, `color_descripcion_texto`, `tiene_expositores`) VALUES
(1, NULL, 'aprobado', NULL, '2026-04-15 03:46:29', 'expo-san-carlos-internacional-2026', 'Expo San Carlos Internacional 2026', 'Los Festejos Populares de Abangares ya se sienten en el ambiente 💃🐂\n\n📅 ABRIL 2026\n📍 Abangares, Guanacaste\n\nTradición, cultura, toros, música, desfiles y mucha fiesta nos esperan 🙌', '2026-04-16', '2026-04-27', 'Cámara de Ganaderos San Carlos, Platanar, Alajuela, Costa Rica', '/assets/images/ExpoSanCarlos2026/ExpoSanCarlosLogo2026.jpeg', 1, '/assets/images/ExpoSanCarlos2026/ExpoSanCarlosHorarioGeneral2026.jpeg', '<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5753.723471566428!2d-84.46625556251665!3d10.440400752165207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa07036dc9a7551%3A0x71aae73e035ab310!2sC%C3%A1mara%20de%20Ganaderos%20de%20San%20Carlos!5e1!3m2!1ses-419!2scr!4v1775694355473!5m2!1ses-419!2scr\" width=\"100%\" height=\"350\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\"></iframe>', NULL, 'gratis', NULL, '#ff00b3', '#000000', '#dedede', '#ff0000', 'rgba(62, 42, 31, 0.6)', '#ffffff', '#ffffff', '#b000c7', '#ffffff', '2026-04-09 19:09:46', '2026-04-20 00:32:25', '#000000', 'Alajuela', '#000000', '#ffffff', '#ffffff', '#000000', '#ffffff', '#000000', '#0e0aff', '#000000', '#ffffff', '#000000', '#000000', NULL, '#ffffff', '2026-04-16 19:10:37', NULL, '#eeeeee', '#ffffff', '#f0f0f0', '#f0f0f0', '#000000', '#ffffff', '#eeeeee', '#c8102e', '#ffffff', '#2c1a0e', 0, NULL, '#2c1a0e', 1),
(200, 6, 'aprobado', NULL, NULL, '1234', '1234', '1234', '2026-04-20', '2026-04-22', '1234', '/assets/uploads/upload-1776689953278-337907048.jpg', 1, NULL, '<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6049.1171736606975!2d-84.47157662344252!3d10.441269165283215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa07161931d39a7%3A0x470d12af3d13a92b!2sExpo%20San%20Carlos!5e1!3m2!1ses-419!2scr!4v1776670958667!5m2!1ses-419!2scr\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>', NULL, 'gratis', NULL, '#c8102e', '#0033a0', '#f4e4c1', '#2c1a0e', 'rgba(0, 0, 0, 0.7)', '#ffffff', '#ffffff', '#d4a373', '#8b5a2b', '2026-04-20 12:59:34', '2026-04-20 13:00:44', '#2c1a0e', 'San José', '#ffffff', '#0a0a0a', '#000000', '#000000', '#f4e4c1', '#2c1a0e', '#8b5a2b', '#8b5a2b', '#ffffff', '#2c1a0e', '#000000', NULL, '#ffffff', NULL, NULL, '#eeeeee', '#ffffff', '#f0f0f0', '#f0f0f0', '#000000', '#ffffff', '#eeeeee', '#C8102E', '#ffffff', '#2c1a0e', 0, NULL, '#2c1a0e', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_usuario_estado` (`usuario_id`,`estado`),
  ADD KEY `idx_estado_activo` (`estado`,`activo`),
  ADD KEY `idx_fecha_envio_revision` (`fecha_envio_revision`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `fk_eventos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

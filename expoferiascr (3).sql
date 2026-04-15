-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 14, 2026 at 05:44 AM
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
-- Table structure for table `actividades`
--

CREATE TABLE `actividades` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `lugar` varchar(200) DEFAULT NULL,
  `precio_extra` decimal(10,2) DEFAULT 0.00,
  `requiere_entrada_online` tinyint(1) DEFAULT 0,
  `enlace_venta` text DEFAULT NULL,
  `es_gratis` tinyint(1) DEFAULT 0,
  `imagen` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `actividades`
--

INSERT INTO `actividades` (`id`, `evento_id`, `titulo`, `tipo`, `descripcion`, `fecha`, `hora`, `lugar`, `precio_extra`, `requiere_entrada_online`, `enlace_venta`, `es_gratis`, `imagen`, `created_at`, `updated_at`) VALUES
(1, 1, 'Concierto Kapo', 'concierto', 'Disfruta del concierto de Kapo en la Expo San Carlos Internacional. Al adquirir tu entrada a través de Smarticket, podrás disfrutar no solo del concierto, sino también del acceso al campo ferial.\n\nLos niños menores de +12 años SOLO en la Gramilla VIP de menores, deben de estar acompañado de un encargado legal, NO SE PERMITE EL CONSUMO DE LICOR en la Gramilla VIP de menores y mayores de +18 años se les tiene PROHIBIDO la entrada a la Gramilla VIP de menores.\n\nCon la compra de la entrada del concierto de kapo, usted podra disfrutar del resto de enventos del campo ferial (no incluye parqueo)', '2026-04-18', '18:00:00', 'Campo ferial - Parte Trasera', NULL, 1, 'https://smarticket.net', 0, '[\"/assets/images/ExpoSanCarlos2026/ExpoSanCarlosKapo2026.jpeg\",\"/assets/uploads/upload-1775967157999-895144965.png\",\"/assets/uploads/upload-1775968532433-322219732.jpeg\",\"/assets/uploads/upload-1775969523102-464248423.jpeg\"]', '2026-04-09 19:09:46', '2026-04-12 04:59:21'),
(2, 1, 'Concierto Los Karkis', 'concierto', 'Disfruta en vivo del concierto de Los Karkis, una agrupación reconocida por su música tropical que pondrá a bailar a todos los asistentes en la Expo San Carlos Internacional.\n\n🎟️ Entrada:\nEvento gratuito con la compra de la entrada general al campo ferial. No tiene costo adicional.', '2026-04-24', '19:00:00', 'Campo ferial - Parte Trasera', NULL, 0, NULL, 1, '/assets/images/ExpoSanCarlos2026/ExpoSanCarlosLosKarkis2026.jpeg', '2026-04-09 19:09:46', '2026-04-11 04:55:49'),
(3, 1, 'Tope Nacional', 'Tope', 'Disfruta del tradicional Tope Nacional de la Expo San Carlos Internacional, uno de los eventos más esperados, donde participan caballistas de todo el país en un ambiente lleno de cultura, tradición y entretenimiento.\n\nSi deseas disfrutar de una mejor experiencia, puedes reservar un espacio exclusivo para ver el evento con mayor comodidad.\n\n📞 Reservaciones:\n8473-6292\n\n🎟️ Entrada:\nIncluida con la entrada general a la Expo', '2026-04-25', '13:00:00', 'Entrada del Campo Ferial', NULL, 0, NULL, 1, 'assets/images/ExpoSanCarlos2026/TopeInternacionalExpo2026.jpg', '2026-04-09 19:42:26', '2026-04-11 04:56:26'),
(4, 1, 'Verano Toreado', 'rodeo', 'Verano toreado de su teletica', '2026-04-25', '20:00:00', 'Redondel de la Expo San Carlos Internacional', NULL, 0, NULL, 0, 'assets\\images\\ExpoSanCarlos2026\\Expositores2026\\verandoToreadoExpo2026.jpg', '2026-04-09 20:01:17', '2026-04-11 04:13:07'),
(8, 1, 'Tope Nocturno', 'Tope', 'Disfruta del tradicional tope nocturno como parte de las actividades de la Expo San Carlos Internacional. Este evento reúne caballos, música y ambiente festivo para toda la familia. Incluida con la entrada general a la Expo (evento gratuito dentro del recinto)', '2026-04-16', '19:00:00', 'Campo ferial - Parte Trasera', NULL, 0, NULL, 1, '/assets/uploads/upload-1775883031619-894469616.jpg', '2026-04-11 04:19:17', '2026-04-11 04:50:33'),
(9, 74, 'Rodeo Eliminatorias Nacionales', 'Rodeo', 'Vive la emoción de las eliminatorias nacionales del rodeo internacional en la expo liberia 2026, solo con pagar la entrada general al campo ferial podras disfrutar de este evento', '2026-04-11', NULL, 'Redondel de la Expo Liberia Internacional 2026', NULL, 0, NULL, 1, '/assets/uploads/upload-1775898003870-656609687.jpg', '2026-04-11 09:00:32', '2026-04-11 21:20:21'),
(10, 1, 'Festival de Bandas', 'Festival', 'Te esperamos el próximo 17 de abril a las 5:00 P.M. ¡No te perdás este espectáculo increíble que inicia con desfile por el campo ferial y finaliza con un show en El Ring, con las mejores bandas del país: Banda Comunal de La Fortuna, Banda 506, Banda de Zarcero y La Banda de Platanar de Florencia', '2026-04-17', '17:00:00', 'Campo ferial - Expo San Carlos Internacional', NULL, 0, NULL, 1, '/assets/uploads/upload-1775898633605-169295706.jpg', '2026-04-11 09:10:36', '2026-04-11 09:10:36');

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
  `color_titulo_h3` varchar(7) DEFAULT '#2c1a0e'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `eventos`
--

INSERT INTO `eventos` (`id`, `usuario_id`, `estado`, `razon_rechazo`, `fecha_envio_revision`, `slug`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `ubicacion`, `imagen_portada`, `activo`, `horario_imagen`, `mapa_embed`, `tipo_venta`, `url_venta_online`, `color_primario`, `color_secundario`, `color_fondo`, `color_texto`, `color_hero_overlay`, `color_titulo_hero`, `color_descripcion_hero`, `color_fondo_fechas`, `color_texto_fechas`, `created_at`, `updated_at`, `color_titulo_seccion`, `provincia`, `color_menu_fondo`, `color_menu_texto`, `color_menu_fondo_hover`, `color_menu_texto_hover`, `color_fondo_contacto`, `color_texto_contacto`, `color_enlace_contacto`, `color_fondo_footer`, `color_texto_footer`, `color_titulo_h3`) VALUES
(1, NULL, 'aprobado', NULL, NULL, 'expo-san-carlos-internacional-2026', 'Expo San Carlos Internacional 2026', 'La feria ganadera y cultural más importante de la zona norte de Costa Rica. Conciertos, rodeos, exposiciones, juegos y mucho más.\nEste año, la expo san carlos internacional 2026, contará con internet en todo su campo ferial', '2026-04-15', '2026-04-27', 'Cámara de Ganaderos San Carlos, Platanar, Alajuela, Costa Rica', '/assets/images/ExpoSanCarlos2026/ExpoSanCarlosLogo2026.jpeg', 1, '/assets/images/ExpoSanCarlos2026/ExpoSanCarlosHorarioGeneral2026.jpeg', '<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5753.723471566428!2d-84.46625556251665!3d10.440400752165207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa07036dc9a7551%3A0x71aae73e035ab310!2sC%C3%A1mara%20de%20Ganaderos%20de%20San%20Carlos!5e1!3m2!1ses-419!2scr!4v1775694355473!5m2!1ses-419!2scr\" width=\"100%\" height=\"350\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\"></iframe>', 'taquilla', NULL, '#b30083', '#000000', '#dedede', '#3e2723', 'rgba(62, 42, 31, 0.6)', '#ffffff', '#ffffff', '#b000c7', '#ffffff', '2026-04-09 19:09:46', '2026-04-12 06:46:22', '#000000', 'Alajuela', '#000000', '#ffffff', '#000000', '#b30083', '#ffffff', '#000000', '#0e0aff', '#000000', '#ffffff', '#000000'),
(74, NULL, 'aprobado', NULL, NULL, 'expo-liberia-internacional-2026', 'Expo Liberia Internacional 2026', 'La feria ganadera y cultural más importante de la de Liberia de Costa Rica. Conciertos, rodeos, exposiciones, juegos y mucho más.', '2026-07-15', '2026-07-27', 'Cámara de Ganaderos de Liberia, Provincia de Guanacaste, Liberia, El Capulín', '/assets/uploads/upload-1775896951578-148187060.jpg', 1, '/assets/uploads/upload-1775897703008-189353795.jpg', '<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1437.5894007849033!2d-85.45801621059104!3d10.620760129251817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f757d18e6490523%3A0x2accc8641143eb43!2sExpo%20Liberia%20Internacional!5e1!3m2!1ses-419!2scr!4v1775896702392!5m2!1ses-419!2scr\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>', 'taquilla', NULL, '#39d600', '#000000', '#dee3e1', '#000000', 'rgba(0, 0, 0, 0.5)', '#ffffff', '#e1ff00', '#ffffff', '#000000', '2026-04-11 08:42:40', '2026-04-12 05:03:18', '#000000', 'Guanacaste', '#000000', '#ffffff', '#000000', '#11fa00', '#ffffff', '#000000', '#004cff', '#000000', '#ffffff', '#2c1a0e'),
(133, 6, 'aprobado', NULL, NULL, 'mi-evento-2026', 'mi evento 2026', '123123123', '2026-04-13', '2026-04-14', '123123', NULL, 1, NULL, NULL, 'taquilla', NULL, '#8b5a2b', '#d4a373', '#f4e4c1', '#2c1a0e', 'rgba(62,42,31,0.7)', '#ffffff', '#ffffff', '#d4a373', '#8b5a2b', '2026-04-14 03:32:33', '2026-04-14 03:39:37', '#2c1a0e', 'San José', '#ffffff', '#ffffff', '#000000', '#000000', '#f4e4c1', '#2c1a0e', '#8b5a2b', '#8b5a2b', '#ffffff', '#2c1a0e');

-- --------------------------------------------------------

--
-- Table structure for table `evento_galeria`
--

CREATE TABLE `evento_galeria` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `imagen_url` text NOT NULL,
  `orden` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evento_galeria`
--

INSERT INTO `evento_galeria` (`id`, `evento_id`, `imagen_url`, `orden`, `created_at`) VALUES
(1, 1, '/assets/images/ExpoSanCarlos2026/CampoFerial/ExpoSanCarlosCampoFerial2026Foto1.jpg', 1, '2026-04-09 19:09:46'),
(2, 1, '/assets/images/ExpoSanCarlos2026/CampoFerial/ExpoSanCarlosCampoFerial2026Foto2.jpg', 2, '2026-04-09 19:09:46'),
(3, 1, '/assets/images/ExpoSanCarlos2026/CampoFerial/ExpoSanCarlosCampoFerial2026Foto3.jpg', 3, '2026-04-09 19:09:46'),
(4, 1, '/assets/images/ExpoSanCarlos2026/CampoFerial/ExpoSanCarlosCampoFerial2026Foto4.jpg', 4, '2026-04-09 19:09:46'),
(6, 74, '/assets/uploads/upload-1775897573710-865823011.jpg', 0, '2026-04-11 08:52:55'),
(7, 74, '/assets/uploads/upload-1775898077699-533489950.jpg', 1, '2026-04-11 09:01:22'),
(8, 74, '/assets/uploads/upload-1775898174906-383586915.jpg', 3, '2026-04-11 09:02:55'),
(9, 1, '/assets/uploads/upload-1775898472876-331028115.jpeg', 5, '2026-04-11 09:07:33');

-- --------------------------------------------------------

--
-- Table structure for table `expositores`
--

CREATE TABLE `expositores` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `rubro` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `es_pagado` tinyint(1) DEFAULT 0,
  `imagen_logo` text DEFAULT NULL,
  `sitio_web` text DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expositores`
--

INSERT INTO `expositores` (`id`, `evento_id`, `nombre`, `rubro`, `descripcion`, `ubicacion`, `es_pagado`, `imagen_logo`, `sitio_web`, `video_url`, `created_at`, `updated_at`) VALUES
(1, 1, 'Cerveza Pilsen', 'Toldo', 'Ven y disfruta del toldo imperial ', 'Campo ferial - Expo San Carlos Internacional - Pilsen', 0, '/assets/images/ExpoSanCarlos2026/Expositores2026/cervezPilsenExpo2026.jpg', NULL, NULL, '2026-04-09 19:09:46', '2026-04-11 22:17:52'),
(9, 1, '1', '1', '1', '1', 0, NULL, NULL, NULL, '2026-04-10 02:44:11', '2026-04-10 02:44:11'),
(10, 1, '2', '2', '2', '2', 0, '2', NULL, NULL, '2026-04-10 02:44:14', '2026-04-10 02:44:14'),
(11, 1, '3', '3', '3', '3', 0, '3', NULL, NULL, '2026-04-10 02:44:18', '2026-04-10 02:44:18'),
(12, 1, '4', '4', '4', '4', 0, NULL, NULL, NULL, '2026-04-10 02:49:31', '2026-04-10 02:49:31'),
(13, 1, '6', '6', '6', '6', 0, NULL, NULL, NULL, '2026-04-10 03:57:41', '2026-04-12 05:33:51');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `codigo_reset` varchar(6) NOT NULL,
  `expira_en` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `usuario_id`, `codigo_reset`, `expira_en`, `usado`, `created_at`) VALUES
(1, 6, '714687', '2026-04-12 19:28:29', 0, '2026-04-13 00:58:29'),
(2, 6, '799698', '2026-04-12 19:37:17', 1, '2026-04-13 01:07:17');

-- --------------------------------------------------------

--
-- Table structure for table `precios_entrada`
--

CREATE TABLE `precios_entrada` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `precio_normal` decimal(10,2) NOT NULL,
  `promocion` varchar(50) DEFAULT NULL,
  `descripcion_promocion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `precios_entrada`
--

INSERT INTO `precios_entrada` (`id`, `evento_id`, `fecha`, `precio_normal`, `promocion`, `descripcion_promocion`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-04-16', 3500.00, 'no', 'precio normal', '2026-04-09 19:09:46', '2026-04-12 03:46:54'),
(2, 1, '2026-04-17', 3500.00, 'no', 'precio normal', '2026-04-09 19:09:46', '2026-04-12 03:46:56'),
(3, 1, '2026-04-18', 5000.00, 'no', 'Precio normal', '2026-04-09 19:09:46', '2026-04-12 03:46:58'),
(4, 1, '2026-04-19', 3500.00, 'no', 'precio normal', '2026-04-09 19:09:46', '2026-04-12 03:47:02'),
(5, 1, '2026-04-20', 3500.00, '3x1', 'Pagan ₡3500 colones y entran 3 personas', '2026-04-09 19:09:46', '2026-04-09 23:34:53'),
(6, 1, '2026-04-21', 3500.00, '3x1', 'Pagan ₡3500 colones y entran 3 personas', '2026-04-09 19:09:46', '2026-04-09 23:34:56'),
(7, 1, '2026-04-22', 3500.00, '3x1', 'Pagan ₡3500 colones y entran 3 personas', '2026-04-09 19:09:46', '2026-04-09 23:34:59'),
(8, 1, '2026-04-23', 3500.00, 'no', 'precio normal', '2026-04-09 19:09:46', '2026-04-12 03:47:04'),
(9, 1, '2026-04-24', 5000.00, 'no', 'precio normal', '2026-04-09 19:09:46', '2026-04-12 03:47:07'),
(10, 1, '2026-04-25', 5000.00, 'no', 'precio normal', '2026-04-09 19:09:46', '2026-04-12 03:47:10'),
(11, 1, '2026-04-26', 3500.00, 'no', 'precio normal', '2026-04-09 19:09:46', '2026-04-12 03:47:12'),
(12, 1, '2026-04-27', 3500.00, 'no', 'precio normal', '2026-04-09 19:09:46', '2026-04-12 03:47:14');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` text NOT NULL,
  `rol` varchar(20) DEFAULT 'user',
  `activo` tinyint(1) DEFAULT 1,
  `email_verificado` tinyint(1) DEFAULT 0,
  `token_verificacion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol`, `activo`, `email_verificado`, `token_verificacion`, `created_at`, `updated_at`) VALUES
(4, 'Carlos', 'jaravillaloboscarlos531@gmail.com', '$2b$10$QJPTwsM9NUK0nUKH801EneSoJp4VbcfoC1tlIW8UAOsOkQoCNneD.', 'admin', 1, 0, NULL, '2026-04-09 19:32:57', '2026-04-09 19:32:57'),
(6, 'Carlos', 'jaravillaloboscarlos@gmail.com', '$2b$10$1FQKDIL7Pg0yWDR.K09DvevN0nJBZwnORf4ELPBQ3D8oWhF9u2fj2', 'usuario', 1, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphcmF2aWxsYWxvYm9zY2FybG9zQGdtYWlsLmNvbSIsImlhdCI6MTc3NjA0MTg1MywiZXhwIjoxNzc2MTI4MjUzfQ.X4TINO8L8AlIDRjU2esKc4zhRDU0oYMX4rJ-SS7lgxA', '2026-04-13 00:57:33', '2026-04-13 01:35:59'),
(7, 'expofiestascr', 'expofiestascr@gmail.com', '$2b$10$S4s2dQs2QcLhZsESI0Q9j.3nqLRKiMZXJVPkRM7hdmYFC46fAcA7i', 'admin', 1, 0, NULL, '2026-04-13 01:29:08', '2026-04-13 01:29:08');

-- --------------------------------------------------------

--
-- Table structure for table `visitas`
--

CREATE TABLE `visitas` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `page_url` varchar(255) NOT NULL,
  `visit_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitas`
--

INSERT INTO `visitas` (`id`, `ip_address`, `page_url`, `visit_date`) VALUES
(1, '::1', '/', '2026-04-10 21:47:54'),
(2, '::1', '/evento.html', '2026-04-10 21:48:06'),
(3, '::1', '/', '2026-04-10 21:48:10'),
(4, '::1', '/', '2026-04-10 21:52:38'),
(5, '::1', '/', '2026-04-10 21:56:13'),
(6, '::1', '/', '2026-04-10 22:03:01'),
(7, '::1', '/evento.html', '2026-04-10 22:03:06'),
(8, '::1', '/', '2026-04-10 22:03:07'),
(9, '::1', '/evento.html', '2026-04-10 22:03:12'),
(10, '::1', '/', '2026-04-10 22:03:16'),
(11, '::1', '/', '2026-04-10 22:05:10'),
(12, '::1', '/evento.html', '2026-04-10 22:05:14'),
(13, '::1', '/', '2026-04-10 22:05:16'),
(14, '::1', '/evento.html', '2026-04-10 22:07:47'),
(15, '::1', '/evento.html', '2026-04-10 22:11:12'),
(16, '::1', '/evento.html', '2026-04-10 22:11:24'),
(17, '::1', '/', '2026-04-10 22:11:36'),
(18, '::1', '/evento.html', '2026-04-10 22:12:02'),
(19, '::1', '/evento.html', '2026-04-10 22:13:09'),
(20, '::1', '/', '2026-04-10 22:15:22'),
(21, '::1', '/evento.html', '2026-04-10 22:15:24'),
(22, '::1', '/evento.html', '2026-04-10 22:20:12'),
(23, '::1', '/', '2026-04-10 22:20:45'),
(24, '::1', '/evento.html', '2026-04-10 22:20:47'),
(25, '::1', '/evento.html', '2026-04-10 22:21:56'),
(26, '::1', '/evento.html', '2026-04-10 22:37:16'),
(27, '::1', '/', '2026-04-10 22:37:17'),
(28, '::1', '/', '2026-04-10 22:50:38'),
(29, '::1', '/evento.html', '2026-04-10 22:50:39'),
(30, '::1', '/', '2026-04-10 22:53:02'),
(31, '::1', '/evento.html', '2026-04-10 22:54:30'),
(32, '::1', '/evento.html', '2026-04-10 22:55:16'),
(33, '::1', '/evento.html', '2026-04-10 22:55:30'),
(34, '::1', '/evento.html', '2026-04-10 22:55:56'),
(35, '::1', '/evento.html', '2026-04-10 22:56:32'),
(36, '::1', '/evento.html', '2026-04-10 22:56:44'),
(37, '::1', '/evento.html', '2026-04-10 23:00:16'),
(38, '::1', '/evento.html', '2026-04-10 23:02:11'),
(39, '::1', '/evento.html', '2026-04-10 23:02:53'),
(40, '::1', '/', '2026-04-10 23:09:07'),
(41, '::1', '/evento.html', '2026-04-10 23:11:58'),
(42, '::1', '/evento.html', '2026-04-10 23:12:16'),
(43, '::1', '/', '2026-04-10 23:12:22'),
(44, '::1', '/evento.html', '2026-04-10 23:12:23'),
(45, '::1', '/', '2026-04-10 23:12:44'),
(46, '::1', '/', '2026-04-10 23:20:47'),
(47, '::1', '/', '2026-04-10 23:25:35'),
(48, '::1', '/evento.html', '2026-04-10 23:25:36'),
(49, '::1', '/', '2026-04-10 23:27:56'),
(50, '::1', '/evento.html', '2026-04-10 23:27:57'),
(51, '::1', '/', '2026-04-11 00:07:38'),
(52, '::1', '/evento.html', '2026-04-11 00:07:41'),
(53, '::1', '/', '2026-04-11 00:18:41'),
(54, '::1', '/evento.html', '2026-04-11 00:18:43'),
(55, '::1', '/evento.html', '2026-04-11 00:18:59'),
(56, '::1', '/', '2026-04-11 00:36:07'),
(57, '::1', '/evento.html', '2026-04-11 00:36:10'),
(58, '::1', '/', '2026-04-11 00:36:34'),
(59, '::1', '/', '2026-04-11 00:38:14'),
(60, '::1', '/evento.html', '2026-04-11 00:38:33'),
(61, '::1', '/', '2026-04-11 00:42:24'),
(62, '::1', '/evento.html', '2026-04-11 00:42:27'),
(63, '::1', '/', '2026-04-11 00:42:31'),
(64, '::1', '/', '2026-04-11 00:47:08'),
(65, '::1', '/', '2026-04-11 00:47:46'),
(66, '::1', '/', '2026-04-11 00:47:59'),
(67, '::1', '/evento.html', '2026-04-11 00:48:12'),
(68, '::1', '/', '2026-04-11 02:36:20'),
(69, '::1', '/evento.html', '2026-04-11 02:43:03'),
(70, '::1', '/evento.html', '2026-04-11 02:43:38'),
(71, '::1', '/evento.html', '2026-04-11 02:43:58'),
(72, '::1', '/evento.html', '2026-04-11 02:44:26'),
(73, '::1', '/evento.html', '2026-04-11 02:44:35'),
(74, '::1', '/evento.html', '2026-04-11 02:44:49'),
(75, '::1', '/', '2026-04-11 02:44:56'),
(76, '::1', '/evento.html', '2026-04-11 02:44:58'),
(77, '::1', '/', '2026-04-11 02:45:03'),
(78, '::1', '/evento.html', '2026-04-11 02:45:05'),
(79, '::1', '/', '2026-04-11 02:45:19'),
(80, '::1', '/evento.html', '2026-04-11 02:45:21'),
(81, '::1', '/', '2026-04-11 02:45:22'),
(82, '::1', '/', '2026-04-11 02:45:49'),
(83, '::1', '/evento.html', '2026-04-11 02:45:56'),
(84, '::1', '/', '2026-04-11 02:45:58'),
(85, '::1', '/evento.html', '2026-04-11 02:46:00'),
(86, '::1', '/', '2026-04-11 02:46:03'),
(87, '::1', '/', '2026-04-11 02:48:02'),
(88, '::1', '/evento.html', '2026-04-11 02:48:10'),
(89, '::1', '/', '2026-04-11 02:48:19'),
(90, '::1', '/evento.html', '2026-04-11 02:48:20'),
(91, '::1', '/', '2026-04-11 02:48:28'),
(92, '::1', '/evento.html', '2026-04-11 02:52:59'),
(93, '::1', '/evento.html', '2026-04-11 02:53:40'),
(94, '::1', '/evento.html', '2026-04-11 02:53:53'),
(95, '::1', '/evento.html', '2026-04-11 02:55:05'),
(96, '::1', '/evento.html', '2026-04-11 02:55:23'),
(97, '::1', '/evento.html', '2026-04-11 02:56:40'),
(98, '::1', '/evento.html', '2026-04-11 02:56:53'),
(99, '::1', '/evento.html', '2026-04-11 02:56:59'),
(100, '::1', '/evento.html', '2026-04-11 02:57:14'),
(101, '::1', '/evento.html', '2026-04-11 02:57:21'),
(102, '::1', '/evento.html', '2026-04-11 03:00:35'),
(103, '::1', '/evento.html', '2026-04-11 03:01:26'),
(104, '::1', '/evento.html', '2026-04-11 03:02:57'),
(105, '::1', '/', '2026-04-11 03:03:28'),
(106, '::1', '/evento.html', '2026-04-11 03:03:37'),
(107, '::1', '/evento.html', '2026-04-11 03:05:53'),
(108, '::1', '/evento.html', '2026-04-11 03:06:50'),
(109, '::1', '/', '2026-04-11 03:06:57'),
(110, '::1', '/evento.html', '2026-04-11 03:06:59'),
(111, '::1', '/', '2026-04-11 03:07:18'),
(112, '::1', '/evento.html', '2026-04-11 03:07:36'),
(113, '::1', '/evento.html', '2026-04-11 03:07:56'),
(114, '::1', '/', '2026-04-11 03:10:39'),
(115, '::1', '/evento.html', '2026-04-11 03:10:40'),
(116, '::1', '/', '2026-04-11 03:10:57'),
(117, '::1', '/', '2026-04-11 03:18:03'),
(118, '::1', '/', '2026-04-11 03:18:58'),
(119, '::1', '/', '2026-04-11 03:19:30'),
(120, '::1', '/', '2026-04-11 03:20:41'),
(121, '::1', '/', '2026-04-11 03:21:22'),
(122, '::1', '/', '2026-04-11 03:22:04'),
(123, '::1', '/', '2026-04-11 03:22:26'),
(124, '::1', '/', '2026-04-11 03:22:33'),
(125, '::1', '/', '2026-04-11 03:22:57'),
(126, '::1', '/', '2026-04-11 03:26:51'),
(127, '::1', '/', '2026-04-11 03:26:59'),
(128, '::1', '/evento.html', '2026-04-11 03:27:04'),
(129, '::1', '/evento.html', '2026-04-11 03:27:08'),
(130, '::1', '/evento.html', '2026-04-11 03:27:14'),
(131, '::1', '/', '2026-04-11 03:27:24'),
(132, '::1', '/', '2026-04-11 03:30:08'),
(133, '::1', '/', '2026-04-11 03:31:35'),
(134, '::1', '/', '2026-04-11 03:33:50'),
(135, '::1', '/', '2026-04-11 03:37:24'),
(136, '::1', '/', '2026-04-11 03:37:52'),
(137, '::1', '/', '2026-04-11 03:38:38'),
(138, '::1', '/', '2026-04-11 03:38:48'),
(139, '::1', '/', '2026-04-11 03:40:58'),
(140, '::1', '/', '2026-04-11 03:41:01'),
(141, '::1', '/', '2026-04-11 03:41:05'),
(142, '::1', '/', '2026-04-11 03:41:05'),
(143, '::1', '/', '2026-04-11 03:41:06'),
(144, '::1', '/', '2026-04-11 03:41:06'),
(145, '::1', '/', '2026-04-11 03:41:06'),
(146, '::1', '/', '2026-04-11 03:41:06'),
(147, '::1', '/', '2026-04-11 03:41:18'),
(148, '::1', '/', '2026-04-11 03:41:20'),
(149, '::1', '/', '2026-04-11 03:41:20'),
(150, '::1', '/', '2026-04-11 03:41:20'),
(151, '::1', '/', '2026-04-11 03:41:21'),
(152, '::1', '/', '2026-04-11 03:41:21'),
(153, '::1', '/', '2026-04-11 03:41:21'),
(154, '::1', '/', '2026-04-11 03:41:21'),
(155, '::1', '/', '2026-04-11 03:41:21'),
(156, '::1', '/', '2026-04-11 03:41:21'),
(157, '::1', '/', '2026-04-11 03:41:22'),
(158, '::1', '/', '2026-04-11 03:41:22'),
(159, '::1', '/', '2026-04-11 03:41:22'),
(160, '::1', '/', '2026-04-11 03:41:22'),
(161, '::1', '/', '2026-04-11 03:41:22'),
(162, '::1', '/', '2026-04-11 03:41:57'),
(163, '::1', '/', '2026-04-11 03:43:47'),
(164, '::1', '/', '2026-04-11 03:44:42'),
(165, '::1', '/', '2026-04-11 03:44:47'),
(166, '::1', '/', '2026-04-11 03:44:48'),
(167, '::1', '/', '2026-04-11 03:44:49'),
(168, '::1', '/', '2026-04-11 03:44:49'),
(169, '::1', '/', '2026-04-11 03:44:49'),
(170, '::1', '/', '2026-04-11 03:44:49'),
(171, '::1', '/', '2026-04-11 03:44:50'),
(172, '::1', '/', '2026-04-11 03:44:53'),
(173, '::1', '/', '2026-04-11 03:44:56'),
(174, '::1', '/', '2026-04-11 03:44:58'),
(175, '::1', '/', '2026-04-11 03:45:40'),
(176, '::1', '/', '2026-04-11 03:46:01'),
(177, '::1', '/', '2026-04-11 03:47:06'),
(178, '::1', '/', '2026-04-11 03:48:26'),
(179, '::1', '/', '2026-04-11 03:48:34'),
(180, '::1', '/', '2026-04-11 03:49:08'),
(181, '::1', '/', '2026-04-11 03:49:16'),
(182, '::1', '/', '2026-04-11 03:50:39'),
(183, '::1', '/', '2026-04-11 03:51:04'),
(184, '::1', '/', '2026-04-11 03:51:47'),
(185, '::1', '/', '2026-04-11 03:52:04'),
(186, '::1', '/evento.html', '2026-04-11 03:52:07'),
(187, '::1', '/', '2026-04-11 03:52:09'),
(188, '::1', '/evento.html', '2026-04-11 03:52:11'),
(189, '::1', '/', '2026-04-11 03:52:14'),
(190, '::1', '/evento.html', '2026-04-11 03:52:17'),
(191, '::1', '/', '2026-04-11 03:52:21'),
(192, '::1', '/evento.html', '2026-04-11 03:52:26'),
(193, '::1', '/', '2026-04-11 03:52:27'),
(194, '::1', '/', '2026-04-11 03:53:30'),
(195, '::1', '/evento.html', '2026-04-11 03:53:31'),
(196, '::1', '/', '2026-04-11 03:53:34'),
(197, '::1', '/evento.html', '2026-04-11 03:53:36'),
(198, '::1', '/', '2026-04-11 03:57:06'),
(199, '::1', '/evento.html', '2026-04-11 03:57:13'),
(200, '::1', '/evento.html', '2026-04-11 03:58:29'),
(201, '::1', '/', '2026-04-11 03:58:33'),
(202, '::1', '/evento.html', '2026-04-11 03:58:35'),
(203, '::1', '/', '2026-04-11 03:58:40'),
(204, '::1', '/evento.html', '2026-04-11 03:59:03'),
(205, '::1', '/', '2026-04-11 03:59:05'),
(206, '::1', '/', '2026-04-11 04:03:21'),
(207, '::1', '/', '2026-04-11 04:03:38'),
(208, '::1', '/', '2026-04-11 04:04:08'),
(209, '::1', '/', '2026-04-11 04:05:11'),
(210, '::1', '/', '2026-04-11 04:05:24'),
(211, '::1', '/', '2026-04-11 15:19:28'),
(212, '::1', '/evento.html', '2026-04-11 15:19:33'),
(213, '::1', '/evento.html', '2026-04-11 15:20:24'),
(214, '::1', '/', '2026-04-11 15:20:29'),
(215, '::1', '/evento.html', '2026-04-11 15:21:14'),
(216, '::1', '/', '2026-04-11 15:21:15'),
(217, '::1', '/evento.html', '2026-04-11 15:21:17'),
(218, '::1', '/', '2026-04-11 15:21:22'),
(219, '::1', '/evento.html', '2026-04-11 15:21:24'),
(220, '::1', '/evento.html', '2026-04-11 15:21:28'),
(221, '::1', '/', '2026-04-11 15:21:38'),
(222, '::1', '/', '2026-04-11 15:21:38'),
(223, '::1', '/evento.html', '2026-04-11 15:21:40'),
(224, '::1', '/evento.html', '2026-04-11 15:22:42'),
(225, '::1', '/evento.html', '2026-04-11 15:27:11'),
(226, '::1', '/', '2026-04-11 15:27:39'),
(227, '::1', '/evento.html', '2026-04-11 15:27:40'),
(228, '::1', '/evento.html', '2026-04-11 15:29:59'),
(229, '::1', '/evento.html', '2026-04-11 15:30:50'),
(230, '::1', '/evento.html', '2026-04-11 15:31:07'),
(231, '::1', '/evento.html', '2026-04-11 15:31:51'),
(232, '::1', '/evento.html', '2026-04-11 15:31:56'),
(233, '::1', '/evento.html', '2026-04-11 15:32:58'),
(234, '::1', '/evento.html', '2026-04-11 15:33:46'),
(235, '::1', '/evento.html', '2026-04-11 15:34:16'),
(236, '::1', '/', '2026-04-11 15:34:19'),
(237, '::1', '/evento.html', '2026-04-11 15:34:20'),
(238, '::1', '/', '2026-04-11 15:34:37'),
(239, '::1', '/evento.html', '2026-04-11 15:34:41'),
(240, '::1', '/', '2026-04-11 15:34:51'),
(241, '::1', '/evento.html', '2026-04-11 15:34:52'),
(242, '::1', '/', '2026-04-11 15:34:55'),
(243, '::1', '/evento.html', '2026-04-11 15:35:04'),
(244, '::1', '/evento.html', '2026-04-11 15:35:20'),
(245, '::1', '/evento.html', '2026-04-11 15:35:27'),
(246, '::1', '/evento.html', '2026-04-11 15:35:42'),
(247, '::1', '/', '2026-04-11 15:36:35'),
(248, '::1', '/evento.html', '2026-04-11 15:36:36'),
(249, '::1', '/', '2026-04-11 15:36:51'),
(250, '::1', '/evento.html', '2026-04-11 15:37:19'),
(251, '::1', '/evento.html', '2026-04-11 15:39:48'),
(252, '::1', '/evento.html', '2026-04-11 15:40:10'),
(253, '::1', '/evento.html', '2026-04-11 15:40:16'),
(254, '::1', '/evento.html', '2026-04-11 15:40:19'),
(255, '::1', '/evento.html', '2026-04-11 15:40:43'),
(256, '::1', '/', '2026-04-11 15:41:12'),
(257, '::1', '/evento.html', '2026-04-11 15:41:13'),
(258, '::1', '/', '2026-04-11 15:41:19'),
(259, '::1', '/', '2026-04-11 15:43:17'),
(260, '::1', '/evento.html', '2026-04-11 15:43:18'),
(261, '::1', '/evento.html', '2026-04-11 15:43:33'),
(262, '::1', '/evento.html', '2026-04-11 15:44:49'),
(263, '::1', '/evento.html', '2026-04-11 15:45:16'),
(264, '::1', '/evento.html', '2026-04-11 15:51:53'),
(265, '::1', '/evento.html', '2026-04-11 15:54:30'),
(266, '::1', '/evento.html', '2026-04-11 15:58:52'),
(267, '::1', '/', '2026-04-11 15:59:21'),
(268, '::1', '/evento.html', '2026-04-11 15:59:22'),
(269, '::1', '/evento.html', '2026-04-11 16:01:06'),
(270, '::1', '/', '2026-04-11 16:01:12'),
(271, '::1', '/evento.html', '2026-04-11 16:01:13'),
(272, '::1', '/evento.html', '2026-04-11 16:01:34'),
(273, '::1', '/evento.html', '2026-04-11 16:01:43'),
(274, '::1', '/evento.html', '2026-04-11 16:02:04'),
(275, '::1', '/evento.html', '2026-04-11 16:02:14'),
(276, '::1', '/evento.html', '2026-04-11 16:02:42'),
(277, '::1', '/evento.html', '2026-04-11 16:03:14'),
(278, '::1', '/evento.html', '2026-04-11 16:03:27'),
(279, '::1', '/evento.html', '2026-04-11 16:03:58'),
(280, '::1', '/', '2026-04-11 16:04:22'),
(281, '::1', '/evento.html', '2026-04-11 16:04:26'),
(282, '::1', '/', '2026-04-11 16:04:32'),
(283, '::1', '/evento.html', '2026-04-11 16:04:35'),
(284, '::1', '/evento.html', '2026-04-11 16:04:50'),
(285, '::1', '/', '2026-04-11 16:04:54'),
(286, '::1', '/evento.html', '2026-04-11 16:04:55'),
(287, '::1', '/', '2026-04-11 16:05:03'),
(288, '::1', '/evento.html', '2026-04-11 16:06:28'),
(289, '::1', '/evento.html', '2026-04-11 16:06:29'),
(290, '::1', '/', '2026-04-11 16:06:55'),
(291, '::1', '/evento.html', '2026-04-11 16:06:58'),
(292, '::1', '/', '2026-04-11 16:07:05'),
(293, '::1', '/evento.html', '2026-04-11 16:07:06'),
(294, '::1', '/', '2026-04-11 16:07:07'),
(295, '::1', '/evento.html', '2026-04-11 16:07:08'),
(296, '::1', '/', '2026-04-11 16:07:13'),
(297, '::1', '/evento.html', '2026-04-11 16:07:14'),
(298, '::1', '/', '2026-04-11 16:07:18'),
(299, '::1', '/evento.html', '2026-04-11 16:07:19'),
(300, '::1', '/', '2026-04-11 16:07:43'),
(301, '::1', '/evento.html', '2026-04-11 16:07:44'),
(302, '::1', '/', '2026-04-11 16:07:45'),
(303, '::1', '/evento.html', '2026-04-11 16:07:58'),
(304, '::1', '/', '2026-04-11 16:08:00'),
(305, '::1', '/', '2026-04-11 16:08:15'),
(306, '::1', '/', '2026-04-11 16:08:18'),
(307, '::1', '/', '2026-04-11 16:08:19'),
(308, '::1', '/', '2026-04-11 16:08:23'),
(309, '::1', '/evento.html', '2026-04-11 16:08:23'),
(310, '::1', '/', '2026-04-11 16:08:39'),
(311, '::1', '/', '2026-04-11 16:09:56'),
(312, '::1', '/evento.html', '2026-04-11 16:11:22'),
(313, '::1', '/', '2026-04-11 16:12:42'),
(314, '::1', '/evento.html', '2026-04-11 16:12:45'),
(315, '::1', '/', '2026-04-11 16:13:24'),
(316, '::1', '/evento.html', '2026-04-11 16:13:39'),
(317, '::1', '/', '2026-04-11 16:14:55'),
(318, '::1', '/', '2026-04-11 16:15:20'),
(319, '::1', '/evento.html', '2026-04-11 16:15:52'),
(320, '::1', '/', '2026-04-11 16:15:56'),
(321, '::1', '/evento.html', '2026-04-11 16:16:10'),
(322, '::1', '/', '2026-04-11 16:16:14'),
(323, '::1', '/evento.html', '2026-04-11 16:16:20'),
(324, '::1', '/evento.html', '2026-04-11 16:17:35'),
(325, '::1', '/evento.html', '2026-04-11 16:17:54'),
(326, '::1', '/', '2026-04-11 16:19:00'),
(327, '::1', '/evento.html', '2026-04-11 16:28:10'),
(328, '::1', '/', '2026-04-11 16:28:19'),
(329, '::1', '/evento.html', '2026-04-11 16:28:21'),
(330, '::1', '/', '2026-04-11 16:28:28'),
(331, '::1', '/', '2026-04-11 16:35:03'),
(332, '::1', '/', '2026-04-11 16:35:12'),
(333, '::1', '/evento.html', '2026-04-11 16:35:27'),
(334, '::1', '/', '2026-04-11 16:35:40'),
(335, '::1', '/evento.html', '2026-04-11 16:35:42'),
(336, '::1', '/', '2026-04-11 16:35:44'),
(337, '::1', '/evento.html', '2026-04-11 16:35:56'),
(338, '::1', '/', '2026-04-11 16:35:59'),
(339, '::1', '/', '2026-04-11 16:36:13'),
(340, '::1', '/', '2026-04-11 16:36:18'),
(341, '::1', '/', '2026-04-11 16:36:26'),
(342, '::1', '/evento.html', '2026-04-11 16:36:53'),
(343, '::1', '/evento.html', '2026-04-11 16:37:36'),
(344, '::1', '/evento.html', '2026-04-11 16:37:49'),
(345, '::1', '/', '2026-04-11 16:38:22'),
(346, '::1', '/', '2026-04-11 16:38:26'),
(347, '::1', '/evento.html', '2026-04-11 16:38:35'),
(348, '::1', '/', '2026-04-11 16:38:37'),
(349, '::1', '/', '2026-04-11 16:38:49'),
(350, '::1', '/', '2026-04-11 16:40:16'),
(351, '::1', '/', '2026-04-11 16:41:14'),
(352, '::ffff:127.0.0.1', '/', '2026-04-11 16:43:55'),
(353, '::ffff:127.0.0.1', '/', '2026-04-11 16:43:58'),
(354, '::1', '/', '2026-04-11 16:44:36'),
(355, '::1', '/', '2026-04-11 16:46:17'),
(356, '::1', '/', '2026-04-11 16:46:45'),
(357, '::1', '/', '2026-04-11 16:47:06'),
(358, '::1', '/', '2026-04-11 16:47:54'),
(359, '::1', '/', '2026-04-11 18:21:53'),
(360, '::1', '/', '2026-04-11 18:24:39'),
(361, '::1', '/evento.html', '2026-04-11 18:26:29'),
(362, '::1', '/', '2026-04-11 18:26:33'),
(363, '::1', '/', '2026-04-11 18:32:17'),
(364, '::1', '/evento.html', '2026-04-11 18:39:04'),
(365, '::1', '/', '2026-04-11 18:40:38'),
(366, '::1', '/evento.html', '2026-04-11 18:41:10'),
(367, '::1', '/evento.html', '2026-04-11 18:41:33'),
(368, '::1', '/', '2026-04-11 18:41:35'),
(369, '::1', '/', '2026-04-11 18:44:37'),
(370, '::1', '/evento.html', '2026-04-11 18:44:40'),
(371, '::1', '/', '2026-04-11 18:45:09'),
(372, '::1', '/evento.html', '2026-04-11 18:45:10'),
(373, '::1', '/', '2026-04-11 18:45:19'),
(374, '::1', '/', '2026-04-11 18:50:04'),
(375, '::1', '/', '2026-04-11 18:56:08'),
(376, '::1', '/', '2026-04-11 18:56:27'),
(377, '::1', '/', '2026-04-11 18:56:54'),
(378, '::1', '/', '2026-04-11 19:04:07'),
(379, '::1', '/', '2026-04-11 21:26:26'),
(380, '::1', '/evento.html', '2026-04-11 21:28:26'),
(381, '::1', '/', '2026-04-11 21:30:57'),
(382, '::1', '/evento.html', '2026-04-11 21:31:05'),
(383, '::1', '/', '2026-04-11 21:31:35'),
(384, '::1', '/', '2026-04-11 21:32:56'),
(385, '::1', '/', '2026-04-11 21:33:13'),
(386, '::1', '/', '2026-04-11 21:33:32'),
(387, '::1', '/evento.html', '2026-04-11 21:34:14'),
(388, '::1', '/', '2026-04-11 21:34:26'),
(389, '::1', '/', '2026-04-11 21:44:13'),
(390, '::1', '/', '2026-04-11 21:44:13'),
(391, '::1', '/evento.html', '2026-04-11 21:44:15'),
(392, '::1', '/', '2026-04-11 21:44:27'),
(393, '::1', '/evento.html', '2026-04-11 21:47:19'),
(394, '::1', '/', '2026-04-11 21:47:40'),
(395, '::1', '/evento.html', '2026-04-11 21:48:23'),
(396, '::1', '/', '2026-04-11 21:48:34'),
(397, '::1', '/evento.html', '2026-04-11 21:48:51'),
(398, '::1', '/evento.html', '2026-04-11 22:04:36'),
(399, '::1', '/evento.html', '2026-04-11 22:12:45'),
(400, '::1', '/evento.html', '2026-04-11 22:15:41'),
(401, '::1', '/', '2026-04-11 22:16:07'),
(402, '::1', '/evento.html', '2026-04-11 22:16:09'),
(403, '::1', '/', '2026-04-11 22:16:13'),
(404, '::1', '/', '2026-04-11 22:16:19'),
(405, '::1', '/', '2026-04-11 22:16:27'),
(406, '::1', '/', '2026-04-11 22:16:28'),
(407, '::1', '/', '2026-04-11 22:16:33'),
(408, '::1', '/evento.html', '2026-04-11 22:16:46'),
(409, '::1', '/evento.html', '2026-04-11 22:17:28'),
(410, '::1', '/', '2026-04-11 22:17:49'),
(411, '::1', '/', '2026-04-11 22:18:50'),
(412, '::1', '/', '2026-04-11 22:18:56'),
(413, '::1', '/', '2026-04-11 22:19:57'),
(414, '::1', '/evento.html', '2026-04-11 22:20:00'),
(415, '::1', '/', '2026-04-11 22:22:04'),
(416, '::1', '/', '2026-04-11 22:23:11'),
(417, '::1', '/', '2026-04-11 22:23:18'),
(418, '::1', '/evento.html', '2026-04-11 22:23:26'),
(419, '::1', '/', '2026-04-11 22:23:29'),
(420, '::1', '/evento.html', '2026-04-11 22:23:31'),
(421, '::1', '/', '2026-04-11 22:23:42'),
(422, '::1', '/', '2026-04-11 22:25:34'),
(423, '::1', '/', '2026-04-11 22:26:12'),
(424, '::1', '/', '2026-04-11 22:26:34'),
(425, '::1', '/evento.html', '2026-04-11 22:27:43'),
(426, '::1', '/evento.html', '2026-04-11 22:28:35'),
(427, '::1', '/', '2026-04-11 22:28:36'),
(428, '::1', '/', '2026-04-11 22:29:56'),
(429, '::1', '/', '2026-04-11 22:30:21'),
(430, '::1', '/evento.html', '2026-04-11 22:30:30'),
(431, '::1', '/', '2026-04-11 22:31:11'),
(432, '::1', '/', '2026-04-11 22:35:41'),
(433, '::1', '/evento.html', '2026-04-11 22:35:42'),
(434, '::1', '/evento.html', '2026-04-11 22:37:21'),
(435, '::1', '/evento.html', '2026-04-11 22:41:38'),
(436, '::1', '/evento.html', '2026-04-11 22:49:48'),
(437, '::1', '/', '2026-04-11 22:52:10'),
(438, '::1', '/evento.html', '2026-04-11 22:52:12'),
(439, '::1', '/', '2026-04-11 22:52:26'),
(440, '::1', '/evento.html', '2026-04-11 22:52:43'),
(441, '::1', '/', '2026-04-11 22:52:47'),
(442, '::1', '/evento.html', '2026-04-11 22:52:54'),
(443, '::1', '/', '2026-04-11 22:53:01'),
(444, '::1', '/evento.html', '2026-04-11 22:54:14'),
(445, '::1', '/', '2026-04-11 22:54:19'),
(446, '::1', '/evento.html', '2026-04-11 22:54:20'),
(447, '::1', '/', '2026-04-11 22:54:29'),
(448, '::1', '/evento.html', '2026-04-11 22:54:30'),
(449, '::1', '/', '2026-04-11 22:54:36'),
(450, '::1', '/evento.html', '2026-04-11 22:54:47'),
(451, '::1', '/', '2026-04-11 22:58:08'),
(452, '::1', '/evento.html', '2026-04-11 22:58:09'),
(453, '::1', '/', '2026-04-11 22:58:56'),
(454, '::1', '/evento.html', '2026-04-11 22:58:57'),
(455, '::1', '/', '2026-04-11 22:59:27'),
(456, '::1', '/evento.html', '2026-04-11 22:59:29'),
(457, '::1', '/', '2026-04-11 22:59:53'),
(458, '::1', '/evento.html', '2026-04-11 22:59:56'),
(459, '::1', '/evento.html', '2026-04-11 23:00:45'),
(460, '::1', '/evento.html', '2026-04-11 23:00:54'),
(461, '::1', '/evento.html', '2026-04-11 23:01:01'),
(462, '::1', '/evento.html', '2026-04-11 23:01:10'),
(463, '::1', '/evento.html', '2026-04-11 23:02:07'),
(464, '::1', '/', '2026-04-11 23:02:28'),
(465, '::1', '/', '2026-04-11 23:02:46'),
(466, '::1', '/evento.html', '2026-04-11 23:02:48'),
(467, '::1', '/', '2026-04-11 23:02:54'),
(468, '::1', '/evento.html', '2026-04-11 23:02:55'),
(469, '::1', '/', '2026-04-11 23:03:00'),
(470, '::1', '/evento.html', '2026-04-11 23:03:00'),
(471, '::1', '/', '2026-04-11 23:03:03'),
(472, '::1', '/evento.html', '2026-04-11 23:03:05'),
(473, '::1', '/evento.html', '2026-04-11 23:03:19'),
(474, '::1', '/', '2026-04-11 23:03:30'),
(475, '::1', '/evento.html', '2026-04-11 23:03:35'),
(476, '::1', '/', '2026-04-11 23:03:39'),
(477, '::1', '/evento.html', '2026-04-11 23:03:40'),
(478, '::1', '/', '2026-04-11 23:03:41'),
(479, '::1', '/evento.html', '2026-04-11 23:03:42'),
(480, '::1', '/evento.html', '2026-04-11 23:04:25'),
(481, '::1', '/', '2026-04-11 23:04:35'),
(482, '::1', '/evento.html', '2026-04-11 23:04:46'),
(483, '::1', '/', '2026-04-11 23:05:16'),
(484, '::1', '/evento.html', '2026-04-11 23:05:17'),
(485, '::1', '/', '2026-04-11 23:05:25'),
(486, '::1', '/evento.html', '2026-04-11 23:06:03'),
(487, '::1', '/', '2026-04-11 23:08:33'),
(488, '::1', '/evento.html', '2026-04-11 23:10:23'),
(489, '::1', '/', '2026-04-11 23:13:25'),
(490, '::1', '/evento.html', '2026-04-11 23:13:28'),
(491, '::1', '/', '2026-04-11 23:14:15'),
(492, '::1', '/', '2026-04-11 23:15:53'),
(493, '::1', '/evento.html', '2026-04-11 23:16:01'),
(494, '::1', '/', '2026-04-11 23:16:06'),
(495, '::1', '/evento.html', '2026-04-11 23:16:16'),
(496, '::1', '/', '2026-04-11 23:16:24'),
(497, '::1', '/evento.html', '2026-04-11 23:16:37'),
(498, '::1', '/', '2026-04-11 23:16:39'),
(499, '::1', '/evento.html', '2026-04-11 23:32:25'),
(500, '::1', '/', '2026-04-11 23:32:27'),
(501, '::1', '/evento.html', '2026-04-11 23:32:28'),
(502, '::1', '/evento.html', '2026-04-11 23:33:15'),
(503, '::1', '/', '2026-04-11 23:33:55'),
(504, '::1', '/evento.html', '2026-04-11 23:33:57'),
(505, '::1', '/', '2026-04-11 23:41:45'),
(506, '::1', '/', '2026-04-12 00:44:30'),
(507, '::1', '/', '2026-04-12 00:46:25'),
(508, '::1', '/evento.html', '2026-04-12 00:46:27'),
(509, '::1', '/evento.html', '2026-04-12 01:15:48'),
(510, '::1', '/', '2026-04-12 01:16:13'),
(511, '::1', '/evento.html', '2026-04-12 01:16:14'),
(512, '::1', '/', '2026-04-12 01:16:20'),
(513, '::1', '/', '2026-04-12 14:42:45'),
(514, '::1', '/evento.html', '2026-04-12 14:43:35'),
(515, '::1', '/', '2026-04-12 14:46:26'),
(516, '::1', '/', '2026-04-12 14:46:38'),
(517, '::1', '/evento.html', '2026-04-12 14:46:44'),
(518, '::1', '/evento.html', '2026-04-12 14:47:00'),
(519, '::1', '/', '2026-04-12 14:47:10'),
(520, '::1', '/evento.html', '2026-04-12 14:51:31'),
(521, '::1', '/', '2026-04-12 14:51:48'),
(522, '::1', '/evento.html', '2026-04-12 14:51:53'),
(523, '::1', '/', '2026-04-12 14:51:54'),
(524, '::1', '/evento.html', '2026-04-12 14:51:55'),
(525, '::1', '/evento.html', '2026-04-12 14:53:50'),
(526, '::1', '/', '2026-04-12 18:01:55'),
(527, '::1', '/evento.html', '2026-04-12 18:02:18'),
(528, '::1', '/', '2026-04-12 18:21:37'),
(529, '::1', '/evento.html', '2026-04-12 18:23:49'),
(530, '::1', '/', '2026-04-12 18:45:54'),
(531, '::1', '/evento.html', '2026-04-12 18:46:08'),
(532, '::1', '/evento.html', '2026-04-12 18:46:16'),
(533, '::1', '/', '2026-04-12 18:46:27'),
(534, '::1', '/', '2026-04-12 18:49:53'),
(535, '::1', '/', '2026-04-12 18:51:57'),
(536, '::1', '/', '2026-04-12 18:54:38'),
(537, '::1', '/', '2026-04-12 18:56:06'),
(538, '::1', '/', '2026-04-12 18:57:15'),
(539, '::1', '/', '2026-04-12 18:57:34'),
(540, '::1', '/', '2026-04-12 19:15:59'),
(541, '::1', '/', '2026-04-12 19:18:40'),
(542, '::1', '/', '2026-04-13 00:25:06'),
(543, '::1', '/evento.html', '2026-04-13 00:52:10'),
(544, '::1', '/', '2026-04-13 00:52:10'),
(545, '::1', '/evento.html', '2026-04-13 00:53:46'),
(546, '::1', '/', '2026-04-13 00:53:46'),
(547, '::1', '/evento.html', '2026-04-13 01:02:24'),
(548, '::1', '/evento.html', '2026-04-13 01:04:54'),
(549, '::1', '/evento.html', '2026-04-13 01:05:04'),
(550, '::1', '/evento.html', '2026-04-13 01:05:17'),
(551, '::1', '/evento.html', '2026-04-13 01:05:26'),
(552, '::1', '/evento.html', '2026-04-13 01:05:28'),
(553, '::1', '/evento.html', '2026-04-13 01:05:37'),
(554, '::1', '/evento.html', '2026-04-13 01:06:39'),
(555, '::1', '/evento.html', '2026-04-13 01:11:31'),
(556, '::1', '/evento.html', '2026-04-13 01:15:51'),
(557, '::1', '/evento.html', '2026-04-13 01:16:12'),
(558, '::1', '/evento.html', '2026-04-13 01:16:54'),
(559, '::1', '/', '2026-04-13 01:16:55'),
(560, '::1', '/evento.html', '2026-04-13 01:16:56'),
(561, '::1', '/', '2026-04-13 01:17:01'),
(562, '::1', '/evento.html', '2026-04-13 01:17:04'),
(563, '::1', '/evento.html', '2026-04-13 01:18:34'),
(564, '::1', '/evento.html', '2026-04-13 01:38:59'),
(565, '::1', '/evento.html', '2026-04-13 01:39:06'),
(566, '::1', '/evento.html', '2026-04-13 01:48:50'),
(567, '::1', '/evento.html', '2026-04-13 02:00:11'),
(568, '::1', '/evento.html', '2026-04-13 02:05:14'),
(569, '::1', '/evento.html', '2026-04-13 02:08:52'),
(570, '::1', '/evento.html', '2026-04-13 02:12:54'),
(571, '::1', '/evento.html', '2026-04-13 02:14:16'),
(572, '::1', '/evento.html', '2026-04-13 02:17:03'),
(573, '::1', '/evento.html', '2026-04-13 02:20:25'),
(574, '::1', '/', '2026-04-13 02:20:30'),
(575, '::1', '/evento.html', '2026-04-13 02:20:34'),
(576, '::1', '/', '2026-04-13 02:20:36'),
(577, '::1', '/evento.html', '2026-04-13 18:31:32'),
(578, '::1', '/evento.html', '2026-04-13 18:32:38'),
(579, '::1', '/evento.html', '2026-04-13 18:33:22'),
(580, '::1', '/evento.html', '2026-04-13 18:33:59'),
(581, '::1', '/evento.html', '2026-04-13 18:34:33'),
(582, '::1', '/evento.html', '2026-04-13 18:34:43'),
(583, '::1', '/evento.html', '2026-04-13 18:36:04'),
(584, '::1', '/evento.html', '2026-04-13 18:39:30'),
(585, '::1', '/evento.html', '2026-04-13 18:39:54'),
(586, '::1', '/evento.html', '2026-04-13 18:41:10'),
(587, '::1', '/evento.html', '2026-04-13 18:42:09'),
(588, '::1', '/evento.html', '2026-04-13 18:43:45'),
(589, '::1', '/evento.html', '2026-04-13 18:46:13'),
(590, '::1', '/evento.html', '2026-04-13 18:46:30'),
(591, '::1', '/evento.html', '2026-04-13 19:00:33'),
(592, '::1', '/evento.html', '2026-04-13 19:00:51'),
(593, '::1', '/evento.html', '2026-04-13 19:03:49'),
(594, '::1', '/evento.html', '2026-04-13 19:16:20'),
(595, '::1', '/evento.html', '2026-04-13 19:16:30'),
(596, '::1', '/evento.html', '2026-04-13 19:16:51'),
(597, '::1', '/evento.html', '2026-04-13 19:16:51'),
(598, '::1', '/evento.html', '2026-04-13 19:17:20'),
(599, '::1', '/evento.html', '2026-04-13 19:19:40'),
(600, '::1', '/evento.html', '2026-04-13 19:23:35'),
(601, '::1', '/evento.html', '2026-04-13 19:24:55'),
(602, '::1', '/evento.html', '2026-04-13 19:26:06'),
(603, '::1', '/evento.html', '2026-04-13 19:27:15'),
(604, '::1', '/evento.html', '2026-04-13 19:29:53'),
(605, '::1', '/evento.html', '2026-04-13 19:30:10'),
(606, '::1', '/evento.html', '2026-04-13 19:30:22'),
(607, '::1', '/evento.html', '2026-04-13 19:30:40'),
(608, '::1', '/', '2026-04-13 19:33:20'),
(609, '::1', '/evento.html', '2026-04-13 19:33:27'),
(610, '::1', '/evento.html', '2026-04-13 19:33:40'),
(611, '::1', '/evento.html', '2026-04-13 19:49:51'),
(612, '::1', '/evento.html', '2026-04-13 19:55:06'),
(613, '::1', '/evento.html', '2026-04-13 19:56:36'),
(614, '::1', '/evento.html', '2026-04-13 19:57:39'),
(615, '::1', '/evento.html', '2026-04-13 20:01:25'),
(616, '::1', '/evento.html', '2026-04-13 20:03:15'),
(617, '::1', '/evento.html', '2026-04-13 20:03:30'),
(618, '::1', '/evento.html', '2026-04-13 20:05:38'),
(619, '::1', '/evento.html', '2026-04-13 20:06:53'),
(620, '::1', '/evento.html', '2026-04-13 20:06:55'),
(621, '::1', '/', '2026-04-13 20:34:20'),
(622, '::1', '/evento.html', '2026-04-13 20:34:28'),
(623, '::1', '/evento.html', '2026-04-13 20:42:29'),
(624, '::1', '/evento.html', '2026-04-13 20:43:08'),
(625, '::1', '/evento.html', '2026-04-13 20:43:26'),
(626, '::1', '/evento.html', '2026-04-13 20:43:33'),
(627, '::1', '/evento.html', '2026-04-13 20:43:44'),
(628, '::1', '/evento.html', '2026-04-13 20:44:07'),
(629, '::1', '/evento.html', '2026-04-13 20:44:49'),
(630, '::1', '/evento.html', '2026-04-13 20:44:52'),
(631, '::1', '/evento.html', '2026-04-13 20:44:55'),
(632, '::1', '/evento.html', '2026-04-13 20:47:10'),
(633, '::1', '/evento.html', '2026-04-13 20:47:48'),
(634, '::1', '/evento.html', '2026-04-13 20:48:25'),
(635, '::1', '/evento.html', '2026-04-13 20:48:36'),
(636, '::1', '/evento.html', '2026-04-13 20:51:24'),
(637, '::1', '/evento.html', '2026-04-13 20:52:00'),
(638, '::1', '/evento.html', '2026-04-13 20:56:42'),
(639, '::1', '/evento.html', '2026-04-13 20:56:52'),
(640, '::1', '/evento.html', '2026-04-13 20:57:42'),
(641, '::1', '/evento.html', '2026-04-13 20:57:53'),
(642, '::1', '/evento.html', '2026-04-13 20:57:58'),
(643, '::1', '/evento.html', '2026-04-13 20:58:21'),
(644, '::1', '/evento.html', '2026-04-13 20:58:34'),
(645, '::1', '/evento.html', '2026-04-13 20:59:10'),
(646, '::1', '/evento.html', '2026-04-13 21:02:07'),
(647, '::1', '/evento.html', '2026-04-13 21:02:33'),
(648, '::1', '/evento.html', '2026-04-13 21:03:19'),
(649, '::1', '/evento.html', '2026-04-13 21:04:08'),
(650, '::1', '/evento.html', '2026-04-13 21:04:42'),
(651, '::1', '/evento.html', '2026-04-13 21:05:07'),
(652, '::1', '/evento.html', '2026-04-13 21:05:20'),
(653, '::1', '/evento.html', '2026-04-13 21:05:36'),
(654, '::1', '/evento.html', '2026-04-13 21:06:08'),
(655, '::1', '/', '2026-04-13 21:07:26'),
(656, '::1', '/evento.html', '2026-04-13 21:07:51'),
(657, '::1', '/evento.html', '2026-04-13 21:09:58'),
(658, '::1', '/evento.html', '2026-04-13 21:10:23'),
(659, '::1', '/evento.html', '2026-04-13 21:10:55'),
(660, '::1', '/evento.html', '2026-04-13 21:11:25'),
(661, '::1', '/evento.html', '2026-04-13 21:11:40'),
(662, '::1', '/evento.html', '2026-04-13 21:18:07'),
(663, '::1', '/evento.html', '2026-04-13 21:25:09'),
(664, '::1', '/evento.html', '2026-04-13 21:26:29'),
(665, '::1', '/evento.html', '2026-04-13 21:27:22'),
(666, '::1', '/evento.html', '2026-04-13 21:30:37'),
(667, '::1', '/evento.html', '2026-04-13 21:32:31'),
(668, '::1', '/evento.html', '2026-04-13 21:37:38'),
(669, '::1', '/evento.html', '2026-04-13 21:37:52'),
(670, '::1', '/evento.html', '2026-04-13 21:37:57'),
(671, '::1', '/evento.html', '2026-04-13 21:38:26'),
(672, '::1', '/evento.html', '2026-04-13 21:40:03'),
(673, '::1', '/', '2026-04-13 21:40:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_evento` (`evento_id`),
  ADD KEY `idx_fecha` (`fecha`);

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
-- Indexes for table `evento_galeria`
--
ALTER TABLE `evento_galeria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_evento` (`evento_id`);

--
-- Indexes for table `expositores`
--
ALTER TABLE `expositores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_evento` (`evento_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_codigo` (`usuario_id`,`codigo_reset`),
  ADD KEY `idx_expira` (`expira_en`);

--
-- Indexes for table `precios_entrada`
--
ALTER TABLE `precios_entrada`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `evento_id` (`evento_id`,`fecha`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_rol` (`rol`),
  ADD KEY `idx_email_verificado` (`email`,`email_verificado`);

--
-- Indexes for table `visitas`
--
ALTER TABLE `visitas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ip` (`ip_address`),
  ADD KEY `idx_date` (`visit_date`),
  ADD KEY `idx_page` (`page_url`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT for table `evento_galeria`
--
ALTER TABLE `evento_galeria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `expositores`
--
ALTER TABLE `expositores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `precios_entrada`
--
ALTER TABLE `precios_entrada`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `visitas`
--
ALTER TABLE `visitas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=674;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `actividades`
--
ALTER TABLE `actividades`
  ADD CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `fk_eventos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `evento_galeria`
--
ALTER TABLE `evento_galeria`
  ADD CONSTRAINT `evento_galeria_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expositores`
--
ALTER TABLE `expositores`
  ADD CONSTRAINT `expositores_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `precios_entrada`
--
ALTER TABLE `precios_entrada`
  ADD CONSTRAINT `precios_entrada_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

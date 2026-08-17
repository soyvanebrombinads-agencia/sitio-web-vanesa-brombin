<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

$destinatario = 'hola@vanesabrombin.com.ar';

function campo($nombre) {
    return isset($_POST[$nombre]) ? trim($_POST[$nombre]) : '';
}

// Honeypot: si este campo viene completo, es un bot.
if (campo('empresa_web') !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$nombre  = campo('name');
$negocio = campo('brand');
$email   = campo('email');
$social  = campo('social');
$mensaje = campo('message');
$necesidades = isset($_POST['need']) && is_array($_POST['need']) ? $_POST['need'] : [];

if ($nombre === '' || $negocio === '' || $email === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'campos_requeridos']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'email_invalido']);
    exit;
}

// Evita inyección de headers vía saltos de línea en campos que van al header del mail.
$limpiarHeader = function ($valor) {
    return str_replace(["\r", "\n"], '', $valor);
};
$nombre = $limpiarHeader($nombre);
$email  = $limpiarHeader($email);

$asunto = 'Nueva consulta desde vanesabrombinpublicidad.uno';

$cuerpo  = "Nuevo mensaje desde el formulario de contacto del sitio:\n\n";
$cuerpo .= "Nombre: {$nombre}\n";
$cuerpo .= "Negocio/marca: {$negocio}\n";
$cuerpo .= "Email: {$email}\n";
$cuerpo .= "Instagram/sitio: {$social}\n";
$cuerpo .= "Qué necesita: " . (empty($necesidades) ? '-' : implode(', ', $necesidades)) . "\n\n";
$cuerpo .= "Mensaje:\n{$mensaje}\n";

$headers  = "From: Formulario Vanesa Brombin <no-reply@vanesabrombinpublicidad.uno>\r\n";
$headers .= "Reply-To: {$nombre} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$enviado = mail($destinatario, $asunto, $cuerpo, $headers);

if ($enviado) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'envio_fallido']);
}

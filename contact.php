<?php
/**
 * ============================================================
 *  AMP Mogador — contact.php
 *  Gestion du formulaire de contact
 *
 *  Ce fichier :
 *  1. Reçoit les données POST du formulaire
 *  2. Valide et nettoie les entrées
 *  3. Envoie un e-mail à l'administrateur
 *  4. Enregistre le message dans un fichier log JSON
 *  5. Retourne une réponse JSON à JavaScript
 *
 *  PRÉREQUIS :
 *  - PHP 7.4+ avec la fonction mail() activée
 *    (ou configurer PHPMailer pour SMTP, voir section optionnelle)
 *  - Le fichier doit être sur un serveur PHP (XAMPP, WAMP, hébergement web...)
 *  - Créer le dossier "logs/" avec les droits d'écriture (chmod 755)
 * ============================================================
 */

// ── Configuration ──────────────────────────────────────────
define('ADMIN_EMAIL',   'contact@amp-mogador.ma');      // ← Changez par votre e-mail
define('SITE_NAME',     'AMP Mogador');
define('LOG_FILE',      __DIR__ . '/logs/messages.json');
define('MAX_MSG_LEN',   2000);
define('MIN_MSG_LEN',   10);

// ── En-têtes HTTP ───────────────────────────────────────────
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// Autoriser uniquement les requêtes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

// ── Fonction utilitaire : nettoyer une chaîne ───────────────
function clean(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// ── Fonction utilitaire : valider un e-mail ─────────────────
function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// ── Récupération et nettoyage des données ───────────────────
$nom     = clean($_POST['nom']     ?? '');
$email   = clean($_POST['email']   ?? '');
$objet   = clean($_POST['objet']   ?? '');
$message = clean($_POST['message'] ?? '');

// ── Validation ──────────────────────────────────────────────
$errors = [];

if (empty($nom) || strlen($nom) < 2) {
    $errors[] = 'Le nom est requis (minimum 2 caractères).';
}

if (empty($email) || !validateEmail($email)) {
    $errors[] = 'Adresse e-mail invalide.';
}

if (empty($objet) || strlen($objet) < 3) {
    $errors[] = "L'objet est requis (minimum 3 caractères).";
}

if (empty($message) || strlen($message) < MIN_MSG_LEN) {
    $errors[] = 'Le message doit contenir au moins ' . MIN_MSG_LEN . ' caractères.';
}

if (strlen($message) > MAX_MSG_LEN) {
    $errors[] = 'Le message ne doit pas dépasser ' . MAX_MSG_LEN . ' caractères.';
}

// Retourner les erreurs de validation
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $errors),
        'errors'  => $errors
    ]);
    exit;
}

// ── Protection anti-spam : vérification honeypot ────────────
// Ajoutez un champ caché "website" dans votre HTML (invisible)
// Les bots le remplissent, les humains non
if (!empty($_POST['website'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Requête invalide.']);
    exit;
}

// ── Protection anti-spam : limitation de fréquence ──────────
session_start();
$now = time();
$lastSent = $_SESSION['last_contact_sent'] ?? 0;

if (($now - $lastSent) < 60) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Veuillez attendre 60 secondes avant d\'envoyer un autre message.'
    ]);
    exit;
}

// ── Construction de l'e-mail ─────────────────────────────────
$dateEnvoi   = date('d/m/Y à H:i:s');
$ipExpéditeur = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';

$sujetEmail  = '[' . SITE_NAME . '] ' . $objet;

$corpsEmail  = "=== Nouveau message reçu via le site " . SITE_NAME . " ===\n\n";
$corpsEmail .= "Date       : " . $dateEnvoi . "\n";
$corpsEmail .= "Nom        : " . $nom . "\n";
$corpsEmail .= "E-mail     : " . $email . "\n";
$corpsEmail .= "Objet      : " . $objet . "\n";
$corpsEmail .= "IP         : " . $ipExpéditeur . "\n";
$corpsEmail .= "\n--- Message ---\n\n";
$corpsEmail .= $message . "\n\n";
$corpsEmail .= "---\nEnvoyé depuis le site " . SITE_NAME . " | " . $_SERVER['HTTP_HOST'];

// En-têtes e-mail
$headersEmail  = "From: " . SITE_NAME . " <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
$headersEmail .= "Reply-To: " . $nom . " <" . $email . ">\r\n";
$headersEmail .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headersEmail .= "MIME-Version: 1.0\r\n";
$headersEmail .= "Content-Type: text/plain; charset=UTF-8\r\n";

// ── Envoi de l'e-mail ────────────────────────────────────────
$emailEnvoye = mail(ADMIN_EMAIL, $sujetEmail, $corpsEmail, $headersEmail);

/*
 * ── OPTIONNEL : PHPMailer via SMTP ──────────────────────────
 * Si mail() ne fonctionne pas (hébergement mutualisé, etc.),
 * décommentez et configurez ce bloc avec PHPMailer :
 *
 * require 'vendor/autoload.php';
 * use PHPMailer\PHPMailer\PHPMailer;
 * use PHPMailer\PHPMailer\Exception;
 *
 * $mail = new PHPMailer(true);
 * try {
 *     $mail->isSMTP();
 *     $mail->Host       = 'smtp.votreserveur.ma';
 *     $mail->SMTPAuth   = true;
 *     $mail->Username   = 'contact@amp-mogador.ma';
 *     $mail->Password   = 'votre_mot_de_passe';
 *     $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
 *     $mail->Port       = 587;
 *     $mail->CharSet    = 'UTF-8';
 *
 *     $mail->setFrom('noreply@amp-mogador.ma', SITE_NAME);
 *     $mail->addAddress(ADMIN_EMAIL, 'Administrateur AMP');
 *     $mail->addReplyTo($email, $nom);
 *
 *     $mail->Subject = $sujetEmail;
 *     $mail->Body    = $corpsEmail;
 *
 *     $emailEnvoye = $mail->send();
 * } catch (Exception $e) {
 *     $emailEnvoye = false;
 * }
 */

// ── Enregistrement dans le log JSON ─────────────────────────
$entreeLog = [
    'id'        => uniqid('msg_', true),
    'date'      => $dateEnvoi,
    'timestamp' => $now,
    'nom'       => $nom,
    'email'     => $email,
    'objet'     => $objet,
    'message'   => $message,
    'ip'        => $ipExpéditeur,
    'envoye'    => $emailEnvoye,
    'statut'    => $emailEnvoye ? 'envoyé' : 'echec_email'
];

// Créer le dossier logs/ si inexistant
if (!is_dir(dirname(LOG_FILE))) {
    mkdir(dirname(LOG_FILE), 0755, true);
}

// Lire les messages existants
$messages = [];
if (file_exists(LOG_FILE)) {
    $contenuActuel = file_get_contents(LOG_FILE);
    $messages = json_decode($contenuActuel, true) ?? [];
}

// Ajouter le nouveau message
$messages[] = $entreeLog;

// Sauvegarder (garder les 500 derniers messages max)
if (count($messages) > 500) {
    $messages = array_slice($messages, -500);
}

file_put_contents(LOG_FILE, json_encode($messages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

// ── Envoyer un e-mail de confirmation à l'expéditeur ────────
$sujetConfirm  = 'Votre message a bien été reçu — ' . SITE_NAME;

$corpsConfirm  = "Bonjour " . $nom . ",\n\n";
$corpsConfirm .= "Nous avons bien reçu votre message concernant : « " . $objet . " ».\n\n";
$corpsConfirm .= "Notre équipe vous répondra dans les plus brefs délais.\n\n";
$corpsConfirm .= "---\nCordialement,\nL'équipe " . SITE_NAME . "\n";
$corpsConfirm .= "Aire Marine Protégée — Essaouira, Maroc\n";
$corpsConfirm .= "www.mpm.gov.ma\n\n";
$corpsConfirm .= "--- Copie de votre message ---\n";
$corpsConfirm .= $message;

$headersConfirm  = "From: " . SITE_NAME . " <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
$headersConfirm .= "MIME-Version: 1.0\r\n";
$headersConfirm .= "Content-Type: text/plain; charset=UTF-8\r\n";

mail($email, $sujetConfirm, $corpsConfirm, $headersConfirm);

// ── Mettre à jour la session anti-spam ──────────────────────
$_SESSION['last_contact_sent'] = $now;

// ── Réponse finale au client JavaScript ─────────────────────
if ($emailEnvoye) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Votre message a été envoyé avec succès. Vous recevrez une confirmation par e-mail.'
    ]);
} else {
    // L'e-mail a échoué, mais on a quand même sauvegardé le message
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Votre message a été reçu et enregistré. Nous vous contacterons prochainement.'
    ]);
}
?>

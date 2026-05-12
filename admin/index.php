<?php
/**
 * Orpulus — Subscriber Admin Panel
 * Change ADMIN_PASSWORD below before deploying!
 * Access at: yourdomain.com/admin/
 */

define('ADMIN_PASSWORD', 'Orpulus@2026'); // ← CHANGE THIS
define('DB_FILE', __DIR__ . '/../db/subscribers.db');

session_start();

// ── Auth ───────────────────────────────────────
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === ADMIN_PASSWORD) {
        $_SESSION['orpulus_admin'] = true;
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
    $error = 'Incorrect password.';
}
if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

$authed = !empty($_SESSION['orpulus_admin']);

// ── CSV Export ─────────────────────────────────
if ($authed && isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="orpulus-subscribers-' . date('Y-m-d') . '.csv"');
    $pdo = new PDO('sqlite:' . DB_FILE);
    $rows = $pdo->query("SELECT name, email, source, created_at FROM subscribers ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Name', 'Email', 'Source', 'Date']);
    foreach ($rows as $r) fputcsv($out, $r);
    fclose($out);
    exit;
}

// ── Fetch data ─────────────────────────────────
$subscribers = [];
$total = 0;
$todayCount = 0;
if ($authed && file_exists(DB_FILE)) {
    $pdo = new PDO('sqlite:' . DB_FILE);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $subscribers = $pdo->query("SELECT * FROM subscribers ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
    $total = count($subscribers);
    $todayCount = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE DATE(created_at) = DATE('now')")->fetchColumn();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Orpulus — Admin</title>
  <style>
    :root {
      --cream: #FBF7F2; --nude: #F4EBE0; --clay-50: #EDD9C5;
      --clay-100: #DFC5A8; --clay-200: #C9A07C; --clay-300: #B07B52;
      --clay-400: #8B5A35; --dark: #251008; --text: #3D2415;
      --muted: #9B7A63; --white: #FFFFFF;
      --border: rgba(176,123,82,0.18);
      --shadow: 0 4px 20px rgba(37,16,8,0.08);
      --radius: 12px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--cream); color: var(--text); font-family: system-ui, sans-serif; font-size: 15px; min-height: 100vh; }

    /* Login */
    .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .login-card {
      background: var(--white); border: 1.5px solid var(--border); border-radius: 20px;
      padding: 52px 44px; width: 100%; max-width: 400px; text-align: center;
      box-shadow: var(--shadow);
    }
    .login-logo { font-family: Georgia, serif; font-size: 2.5rem; letter-spacing: 0.15em; color: var(--clay-400); margin-bottom: 6px; }
    .login-sub  { font-size: 0.82rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 32px; }
    .login-card input[type=password] {
      width: 100%; padding: 13px 18px; border: 1.5px solid var(--border); border-radius: var(--radius);
      font-size: 1rem; background: var(--nude); color: var(--dark); outline: none; margin-bottom: 12px;
    }
    .login-card input[type=password]:focus { border-color: var(--clay-200); }
    .login-card button {
      width: 100%; padding: 13px; background: var(--clay-400); color: #fff;
      border: none; border-radius: var(--radius); font-size: 0.95rem; font-weight: 700;
      cursor: pointer; transition: background 0.2s;
    }
    .login-card button:hover { background: var(--clay-300); }
    .error-msg { color: #B22; font-size: 0.875rem; margin-top: 10px; }

    /* Admin layout */
    .admin-nav {
      background: var(--white); border-bottom: 1px solid var(--border);
      padding: 0 32px; height: 62px; display: flex; align-items: center; justify-content: space-between;
      box-shadow: var(--shadow);
    }
    .admin-nav .brand { font-family: Georgia, serif; font-size: 1.3rem; letter-spacing: 0.1em; color: var(--clay-400); }
    .admin-nav .brand span { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: var(--muted); text-transform: uppercase; margin-left: 10px; }
    .admin-nav form button { padding: 7px 18px; background: var(--nude); border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.82rem; cursor: pointer; color: var(--muted); }
    .admin-nav form button:hover { color: var(--clay-400); border-color: var(--clay-200); }

    .admin-body { padding: 36px 32px; max-width: 1100px; margin: 0 auto; }

    /* Stats */
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 36px; }
    .stat-card {
      background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius);
      padding: 24px 28px; box-shadow: var(--shadow);
    }
    .stat-card .num { font-family: Georgia, serif; font-size: 2.8rem; color: var(--clay-400); letter-spacing: 0.04em; line-height: 1; }
    .stat-card .lbl { font-size: 0.78rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; margin-top: 6px; font-weight: 700; }

    /* Table */
    .table-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 18px; flex-wrap: wrap; gap: 12px;
    }
    .table-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--dark); }
    .export-btn {
      padding: 9px 22px; background: var(--clay-400); color: #fff;
      border-radius: var(--radius); font-size: 0.82rem; font-weight: 700;
      text-decoration: none; transition: background 0.2s;
    }
    .export-btn:hover { background: var(--clay-300); }

    .table-wrap { background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      background: var(--nude); padding: 13px 20px; text-align: left;
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--border);
    }
    tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: var(--cream); }
    td { padding: 13px 20px; font-size: 0.875rem; color: var(--text); }
    td.email { color: var(--clay-400); font-weight: 600; }
    td.source { font-size: 0.78rem; color: var(--muted); }
    .badge {
      display: inline-block; padding: 3px 10px; border-radius: 99px;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      background: var(--clay-50); color: var(--clay-400); border: 1px solid var(--clay-100);
    }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
    .empty-state p { font-size: 0.95rem; }

    @media (max-width: 700px) {
      .stats-row { grid-template-columns: 1fr 1fr; }
      .admin-body { padding: 20px 16px; }
      .admin-nav { padding: 0 16px; }
      td, th { padding: 10px 12px; }
    }
  </style>
</head>
<body>

<?php if (!$authed): ?>
<div class="login-wrap">
  <div class="login-card">
    <div class="login-logo">ORPULUS</div>
    <div class="login-sub">Admin Panel</div>
    <form method="POST">
      <input type="password" name="password" placeholder="Enter admin password" autofocus autocomplete="current-password"/>
      <button type="submit">Sign In</button>
      <?php if ($error): ?><p class="error-msg"><?= htmlspecialchars($error) ?></p><?php endif; ?>
    </form>
  </div>
</div>

<?php else: ?>

<nav class="admin-nav">
  <div class="brand">ORPULUS <span>Subscribers</span></div>
  <form method="POST"><button type="submit" name="logout" value="1">Sign Out</button></form>
</nav>

<div class="admin-body">
  <div class="stats-row">
    <div class="stat-card">
      <div class="num"><?= $total ?></div>
      <div class="lbl">Total Subscribers</div>
    </div>
    <div class="stat-card">
      <div class="num"><?= $todayCount ?></div>
      <div class="lbl">Joined Today</div>
    </div>
    <div class="stat-card">
      <div class="num"><?= $subscribers ? date('d M', strtotime($subscribers[count($subscribers)-1]['created_at'])) : '—' ?></div>
      <div class="lbl">First Sign-up</div>
    </div>
  </div>

  <div class="table-header">
    <h2>All Subscribers</h2>
    <a href="?export=csv" class="export-btn">Export CSV</a>
  </div>

  <div class="table-wrap">
    <?php if (empty($subscribers)): ?>
      <div class="empty-state"><p>No subscribers yet. Share the site to start collecting sign-ups!</p></div>
    <?php else: ?>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Source</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($subscribers as $i => $row): ?>
        <tr>
          <td style="color:var(--muted)"><?= $total - $i ?></td>
          <td><?= htmlspecialchars($row['name']) ?></td>
          <td class="email"><?= htmlspecialchars($row['email']) ?></td>
          <td class="source"><span class="badge"><?= htmlspecialchars($row['source']) ?></span></td>
          <td><?= date('d M Y, H:i', strtotime($row['created_at'])) ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <?php endif; ?>
  </div>
</div>

<?php endif; ?>
</body>
</html>

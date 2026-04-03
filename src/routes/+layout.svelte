<script lang="ts">
	import '../app.css';

	let { data, children } = $props();
</script>

<svelte:head>
	<title>FlashCards</title>
</svelte:head>

{#if data.userId}
	<header>
		<div class="header-inner">
			<a href="/home" class="logo">FlashCards</a>
			<nav>
				<a href="/home">Accueil</a>
				<a href="/history">Historique</a>
			</nav>
			<div class="user-info">
				<span>{data.username}</span>
				<form method="POST" action="/?/logout">
					<button type="submit" class="btn-secondary btn-sm">Changer</button>
				</form>
			</div>
		</div>
	</header>
{/if}

<main class="container fade-in">
	{@render children()}
</main>

<style>
	header {
		background: var(--surface);
		border-bottom: 2px solid var(--accent-secondary);
		padding: 0.8rem 1.5rem;
	}

	.header-inner {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.logo {
		font-size: 1.3rem;
		font-weight: 700;
		color: var(--accent-strong);
		text-decoration: none;
	}

	nav {
		display: flex;
		gap: 1rem;
		flex: 1;
	}

	nav a {
		color: var(--accent-secondary);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.95rem;
	}

	nav a:hover {
		color: var(--accent-strong);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.9rem;
		color: var(--accent-secondary);
		font-weight: 500;
	}

	:global(.btn-sm) {
		padding: 0.3rem 0.7rem;
		font-size: 0.8rem;
	}
</style>

import { execSync } from 'child_process';

try {
  console.log('Running lint-staged...');
  execSync('npx lint-staged', { stdio: 'inherit' });
} catch (error) {
  console.error('Lint-staged failed');
  process.exit(1);
}

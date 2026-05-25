import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';
import 'providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    try {
      await ref
          .read(authProvider.notifier)
          .login(_emailController.text.trim(), _passwordController.text.trim());
    } catch (e) {
      String errorMessage = e.toString();
      if (errorMessage.contains('Invalid login credentials') ||
          errorMessage.contains('akun telah dihapus')) {
        errorMessage = 'Email belum terdaftar atau akun telah dihapus.';
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: Dimens.xxl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Hero(
                      tag: 'app_logo',
                      child: Container(
                        width: 96,
                        height: 96,
                        padding: const EdgeInsets.all(Dimens.lg),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: Dimens.brXl,
                          boxShadow: [Shadows.md],
                        ),
                        child: Image.asset('assets/images/Logo-awal.png'),
                      ),
                    ).animate().scale(delay: 200.ms).fadeIn(),
                  ),
                  const SizedBox(height: Dimens.xxxl),
                  Text(
                    'Selamat Datang',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ).animate().fadeIn(delay: 400.ms).slideX(begin: -0.1),
                  const SizedBox(height: Dimens.sm),
                  Text(
                    'Kelola keuangan dan operasional dalam satu aplikasi.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ).animate().fadeIn(delay: 600.ms).slideX(begin: -0.1),
                  const SizedBox(height: Dimens.xxxxl),
                  _buildTextField(
                    label: 'Email',
                    controller: _emailController,
                    icon: Icons.email_outlined,
                    hint: 'nama@bisnis.com',
                  ).animate().fadeIn(delay: 800.ms).slideY(begin: 0.1),
                  const SizedBox(height: Dimens.lg),
                  _buildTextField(
                    label: 'Kata Sandi',
                    controller: _passwordController,
                    icon: Icons.lock_outline,
                    isPassword: true,
                    hint: 'Masukkan kata sandi',
                  ).animate().fadeIn(delay: 900.ms).slideY(begin: 0.1),
                  const SizedBox(height: Dimens.sm),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => _showForgotPasswordDialog(context),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        padding: Dimens.buttonSm,
                      ),
                      child: const Text('Lupa Kata Sandi?'),
                    ),
                  ).animate().fadeIn(delay: 1000.ms),
                  const SizedBox(height: Dimens.xl),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: authState.isLoading ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.textPrimary,
                        foregroundColor: AppColors.textInverse,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: Dimens.brMd,
                        ),
                      ),
                      child: authState.isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                color: AppColors.textInverse,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text('Masuk'),
                    ),
                  ).animate().fadeIn(delay: 1100.ms),
                  const SizedBox(height: Dimens.xxl),
                  Center(
                    child: TextButton(
                      onPressed: () async {
                        final urlStr =
                            dotenv.env['WEB_URL'] ?? 'https://tetasin.com';
                        final url = Uri.parse('$urlStr/register');
                        if (!await launchUrl(
                          url,
                          mode: LaunchMode.externalApplication,
                        )) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Gagal membuka browser'),
                              ),
                            );
                          }
                        }
                      },
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.textSecondary,
                      ),
                      child: RichText(
                        text: TextSpan(
                          style: Theme.of(context).textTheme.bodyMedium,
                          children: const [
                            TextSpan(text: 'Belum punya akun? '),
                            TextSpan(
                              text: 'Daftar via Web',
                              style: TextStyle(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w700,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ).animate().fadeIn(delay: 1200.ms),
                  Center(
                    child: TextButton(
                      onPressed: () =>
                          ref.read(authProvider.notifier).loginAsGuest(),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primary,
                      ),
                      child: const Text('Atau Coba Mode Tamu'),
                    ),
                  ).animate().fadeIn(delay: 1300.ms),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showForgotPasswordDialog(BuildContext context) {
    final emailCtrl = TextEditingController(text: _emailController.text);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reset Kata Sandi'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Masukkan email Anda. Kami akan mengirimkan link reset kata sandi.',
            ),
            const SizedBox(height: 12),
            TextField(
              controller: emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                hintText: 'nama@email.com',
                prefixIcon: Icon(Icons.email_outlined),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final email = emailCtrl.text.trim();
              if (email.isEmpty) return;
              try {
                await ref
                    .read(authProvider.notifier)
                    .sendPasswordReset(email);
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Link reset kata sandi telah dikirim.'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (ctx.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Gagal: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text('Kirim'),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    bool isPassword = false,
    String? hint,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: Dimens.sm),
        TextField(
          controller: controller,
          obscureText: isPassword && !_isPasswordVisible,
          style: Theme.of(context).textTheme.bodyLarge,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: AppColors.textTertiary),
            prefixIcon: Icon(icon, color: AppColors.textTertiary, size: 20),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      _isPasswordVisible
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: AppColors.textTertiary,
                      size: 20,
                    ),
                    onPressed: () => setState(
                      () => _isPasswordVisible = !_isPasswordVisible,
                    ),
                  )
                : null,
          ),
        ),
      ],
    );
  }
}

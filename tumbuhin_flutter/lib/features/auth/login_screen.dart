import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
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
      await ref.read(authProvider.notifier).login(
            _emailController.text.trim(),
            _passwordController.text.trim(),
          );
    } catch (e) {
      String errorMessage = e.toString();
      if (errorMessage.contains('Invalid login credentials') || errorMessage.contains('akun telah dihapus')) {
        errorMessage = 'Email belum terdaftar atau akun telah dihapus.';
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo Section
                Center(
                  child: Hero(
                    tag: 'app_logo',
                    child: Container(
                      height: 100,
                      width: 100,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Image.asset('assets/images/Logo-awal.png'),
                    ),
                  ).animate().scale(delay: 200.ms).fadeIn(),
                ),
                const SizedBox(height: 40),
                
                // Welcome Text
                Text(
                  'Selamat Datang',
                  style: GoogleFonts.outfit(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF2D3436),
                  ),
                ).animate().fadeIn(delay: 400.ms).slideX(begin: -0.2),
                const SizedBox(height: 8),
                Text(
                  'Kelola operasional dan keuangan bisnismu dalam satu aplikasi cerdas.',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    color: Colors.grey.shade600,
                    height: 1.5,
                  ),
                ).animate().fadeIn(delay: 600.ms).slideX(begin: -0.2),
                
                const SizedBox(height: 48),
                
                // Form Fields
                _buildTextField(
                  label: 'Alamat Email',
                  controller: _emailController,
                  icon: Icons.email_outlined,
                  hint: 'nama@bisnis.com',
                ).animate().fadeIn(delay: 800.ms).slideY(begin: 0.2),
                const SizedBox(height: 20),
                _buildTextField(
                  label: 'Kata Sandi',
                  controller: _passwordController,
                  icon: Icons.lock_outline,
                  isPassword: true,
                  hint: '••••••••',
                ).animate().fadeIn(delay: 900.ms).slideY(begin: 0.2),
                
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: Text(
                      'Lupa Kata Sandi?',
                      style: GoogleFonts.outfit(
                        color: const Color(0xFFFDB827),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ).animate().fadeIn(delay: 1000.ms),
                
                const SizedBox(height: 32),
                
                // Login Button
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: authState.isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2D3436),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: authState.isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            'Masuk Sekarang',
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ).animate().fadeIn(delay: 1100.ms).scale(begin: const Offset(0.9, 0.9)),
                
                const SizedBox(height: 24),
                
                // Register Link
                Center(
                  child: TextButton(
                    onPressed: () async {
                      final urlStr = dotenv.env['WEB_URL'] ?? 'https://tumbuhin.com';
                      final url = Uri.parse('$urlStr/register');
                      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Gagal membuka browser')),
                          );
                        }
                      }
                    },
                    child: RichText(
                      text: TextSpan(
                        style: GoogleFonts.outfit(color: Colors.grey.shade600),
                        children: const [
                          TextSpan(text: 'Belum punya akun? '),
                          TextSpan(
                            text: 'Daftar via Web',
                            style: TextStyle(
                              color: Color(0xFF2D3436),
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ).animate().fadeIn(delay: 1200.ms),

                // Guest Mode
                Center(
                  child: TextButton(
                    onPressed: () {
                      ref.read(authProvider.notifier).loginAsGuest();
                    },
                    child: Text(
                      'Atau Coba Mode Tamu',
                      style: GoogleFonts.outfit(
                        color: const Color(0xFFFDB827),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
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
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF2D3436),
          ),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: controller,
          obscureText: isPassword && !_isPasswordVisible,
          style: GoogleFonts.outfit(),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.grey.shade400),
            prefixIcon: Icon(icon, color: Colors.grey.shade400, size: 22),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      _isPasswordVisible ? Icons.visibility_off : Icons.visibility,
                      color: Colors.grey.shade400,
                    ),
                    onPressed: () => setState(() => _isPasswordVisible = !_isPasswordVisible),
                  )
                : null,
            filled: true,
            fillColor: Colors.grey.shade50,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: Colors.grey.shade200),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFFDB827), width: 2),
            ),
          ),
        ),
      ],
    );
  }
}

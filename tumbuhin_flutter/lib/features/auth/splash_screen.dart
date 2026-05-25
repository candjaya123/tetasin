import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(color: Colors.white),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated Logo Container
                Hero(
                  tag: 'app_logo',
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Image.asset(
                      'assets/images/Logo-awal.png',
                      height: 120,
                      width: 120,
                    ),
                  ),
                ),
                const SizedBox(height: 40),
                Text(
                  'Tetasin',
                  style: GoogleFonts.outfit(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                    color: const Color(0xFF2D3436),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Solusi Bisnis & Keuangan Cerdas',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    color: Colors.grey.shade600,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 80),
                const SizedBox(
                  width: 40,
                  height: 40,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Color(0xFFFDB827),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.black,
        surface: AppColors.white,
        error: AppColors.error,
        onPrimary: AppColors.onPrimary,
        onSecondary: AppColors.white,
        onSurface: AppColors.black,
      ),
      scaffoldBackgroundColor: AppColors.background,
      
      // Typography — Outfit, matching PWA's bold style
      textTheme: GoogleFonts.outfitTextTheme().copyWith(
        displayLarge: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: AppColors.black),
        displayMedium: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: AppColors.black),
        headlineLarge: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: AppColors.black, fontSize: 26),
        headlineMedium: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.black, fontSize: 22),
        headlineSmall: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.black, fontSize: 18),
        titleLarge: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.black, fontSize: 16),
        titleMedium: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: AppColors.black, fontSize: 14),
        titleSmall: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: AppColors.darkGrey, fontSize: 13),
        bodyLarge: GoogleFonts.outfit(fontWeight: FontWeight.w500, color: AppColors.darkGrey, fontSize: 15),
        bodyMedium: GoogleFonts.outfit(fontWeight: FontWeight.w400, color: AppColors.darkGrey, fontSize: 14),
        bodySmall: GoogleFonts.outfit(fontWeight: FontWeight.w400, color: AppColors.mediumGrey, fontSize: 12),
        labelLarge: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14),
        labelSmall: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 11),
      ),

      // AppBar — white with bottom shadow like PWA
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.black,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: AppColors.border,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: AppColors.black,
        ),
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        iconTheme: const IconThemeData(color: AppColors.black),
        actionsIconTheme: const IconThemeData(color: AppColors.black),
      ),

      // Bottom Navigation Bar
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: AppColors.white,
        selectedItemColor: AppColors.onPrimary,
        unselectedItemColor: AppColors.lightGrey,
        selectedLabelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 11),
        unselectedLabelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w500, fontSize: 11),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        showSelectedLabels: true,
        showUnselectedLabels: true,
      ),

      // Elevated Button — yellow, round, bold like PWA
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          minimumSize: const Size.fromHeight(56),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w800,
            fontSize: 16,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),

      // Outlined Button
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.black,
          side: const BorderSide(color: AppColors.border, width: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      ),

      // Text Button
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700),
        ),
      ),

      // Input Field
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        hintStyle: GoogleFonts.outfit(color: AppColors.lightGrey, fontWeight: FontWeight.w400),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      ),

      // Card
      cardTheme: CardThemeData(
        color: AppColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.border),
        ),
        margin: EdgeInsets.zero,
      ),

      // Divider
      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 1,
        space: 1,
      ),

      // SnackBar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.black,
        contentTextStyle: GoogleFonts.outfit(color: AppColors.white, fontWeight: FontWeight.w600),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),

      // Chip
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surface,
        selectedColor: AppColors.primary,
        labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      ),
    );
  }
}

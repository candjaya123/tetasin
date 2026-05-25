import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';
import 'dimens.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        secondary: AppColors.textPrimary,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.background,

      textTheme: GoogleFonts.outfitTextTheme().copyWith(
        displayLarge: GoogleFonts.outfit(
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
          fontSize: 32,
          height: 1.15,
        ),
        headlineLarge: GoogleFonts.outfit(
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
          fontSize: 26,
          height: 1.2,
        ),
        headlineMedium: GoogleFonts.outfit(
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
          fontSize: 22,
          height: 1.25,
        ),
        headlineSmall: GoogleFonts.outfit(
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          fontSize: 18,
          height: 1.3,
        ),
        titleLarge: GoogleFonts.outfit(
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          fontSize: 16,
          height: 1.3,
        ),
        titleMedium: GoogleFonts.outfit(
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          fontSize: 14,
          height: 1.35,
        ),
        titleSmall: GoogleFonts.outfit(
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
          fontSize: 13,
          height: 1.35,
        ),
        bodyLarge: GoogleFonts.outfit(
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
          fontSize: 16,
          height: 1.5,
        ),
        bodyMedium: GoogleFonts.outfit(
          fontWeight: FontWeight.w400,
          color: AppColors.textSecondary,
          fontSize: 14,
          height: 1.5,
        ),
        bodySmall: GoogleFonts.outfit(
          fontWeight: FontWeight.w400,
          color: AppColors.textTertiary,
          fontSize: 12,
          height: 1.45,
        ),
        labelLarge: GoogleFonts.outfit(
          fontWeight: FontWeight.w600,
          fontSize: 14,
          height: 1.2,
        ),
        labelSmall: GoogleFonts.outfit(
          fontWeight: FontWeight.w500,
          fontSize: 12,
          height: 1.2,
        ),
      ),

      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        shadowColor: AppColors.divider,
        centerTitle: false,
        titleSpacing: 0,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        iconTheme: const IconThemeData(color: AppColors.textPrimary, size: 22),
        actionsIconTheme: const IconThemeData(
          color: AppColors.textSecondary,
          size: 22,
        ),
      ),

      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.onPrimary,
        unselectedItemColor: AppColors.textTertiary,
        selectedLabelStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.w600,
          fontSize: 11,
        ),
        unselectedLabelStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.w500,
          fontSize: 11,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 10,
        showSelectedLabels: true,
        showUnselectedLabels: true,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          minimumSize: const Size.fromHeight(56),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w700,
            fontSize: 16,
          ),
          padding: Dimens.buttonLg,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          side: const BorderSide(color: AppColors.border),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          textStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.background,
        hintStyle: GoogleFonts.outfit(
          color: AppColors.textTertiary,
          fontWeight: FontWeight.w400,
          fontSize: 15,
        ),
        labelStyle: GoogleFonts.outfit(
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 18,
        ),
      ),

      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.borderLight, width: 0.5),
        ),
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
      ),

      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1,
        space: 1,
      ),

      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.textPrimary,
        contentTextStyle: GoogleFonts.outfit(
          color: AppColors.textInverse,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: Dimens.brSm),
        insetPadding: const EdgeInsets.all(Dimens.lg),
      ),

      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surfaceSecondary,
        selectedColor: AppColors.primary,
        labelStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.w500,
          fontSize: 12,
        ),
        secondaryLabelStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.w500,
          fontSize: 12,
        ),
        shape: RoundedRectangleBorder(borderRadius: Dimens.brXs),
        padding: const EdgeInsets.symmetric(
          horizontal: Dimens.sm,
          vertical: Dimens.xs,
        ),
      ),

      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
        elevation: 0,
        highlightElevation: 0,
        shape: RoundedRectangleBorder(borderRadius: Dimens.brMd),
        extendedTextStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),

      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: Dimens.brXl),
        titleTextStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.w700,
          fontSize: 18,
          color: AppColors.textPrimary,
        ),
        contentTextStyle: GoogleFonts.outfit(
          fontWeight: FontWeight.w400,
          fontSize: 14,
          color: AppColors.textSecondary,
        ),
      ),

      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Dimens.radiusXl),
        ),
      ),

      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearTrackColor: AppColors.surfaceTertiary,
      ),
    );
  }
}

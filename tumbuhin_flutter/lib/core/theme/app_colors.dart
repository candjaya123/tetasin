import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const primary = Color(0xFFFACC15); // warm yellow — desing.md
  static const onPrimary = Color(0xFF1A1A1A);

  // Surfaces
  static const background = Color(0xFFFAFAFA);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSecondary = Color(0xFFF1F5F9); // slate-100
  static const surfaceTertiary = Color(0xFFE2E8F0); // slate-200

  // Text
  static const textPrimary = Color(0xFF1E293B); // slate-800
  static const textSecondary = Color(0xFF64748B); // slate-500
  static const textTertiary = Color(0xFF94A3B8); // slate-400
  static const textInverse = Color(0xFFFFFFFF);

  // Borders & Dividers
  static const border = Color(0xFFE2E8F0); // slate-200
  static const borderLight = Color(0xFFF1F5F9); // slate-100
  static const divider = Color(0xFFF1F5F9); // slate-100

  // Semantic
  static const error = Color(0xFFE53E3E);
  static const errorLight = Color(0xFFFDF0F0);
  static const success = Color(0xFF10B981);
  static const successLight = Color(0xFFEDFBF5);
  static const warning = Color(0xFFF59E0B);
  static const warningLight = Color(0xFFFEF9EC);
  static const info = Color(0xFF3B82F6);
  static const infoLight = Color(0xFFF0F6FF);

  // Legacy aliases (backward compat)
  static const black = textPrimary;
  static const onPrimary2 = onPrimary;
  static const white = surface;
  static const darkGrey = textSecondary;
  static const mediumGrey = textTertiary;
  static const lightGrey = Color(0xFFB0B8C1);
  static const secondary = textPrimary;
}

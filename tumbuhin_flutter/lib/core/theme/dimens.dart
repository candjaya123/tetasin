import 'package:flutter/material.dart';

class Dimens {
  Dimens._();

  static const double xxs = 2;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;
  static const double xxxxl = 40;
  static const double xxxxxl = 48;

  static const double pageH = 20;
  static const double pageV = 20;
  static const double cardH = 20;
  static const double cardV = 20;
  static const double sectionGap = 24;
  static const double itemGap = 16;

  static const Radius radiusXs = Radius.circular(8);
  static const Radius radiusSm = Radius.circular(12);
  static const Radius radiusMd = Radius.circular(16);
  static const Radius radiusLg = Radius.circular(20);
  static const Radius radiusXl = Radius.circular(24);
  static const Radius radiusXxl = Radius.circular(32);

  static const BorderRadius brXs = BorderRadius.all(radiusXs);
  static const BorderRadius brSm = BorderRadius.all(radiusSm);
  static const BorderRadius brMd = BorderRadius.all(radiusMd);
  static const BorderRadius brLg = BorderRadius.all(radiusLg);
  static const BorderRadius brXl = BorderRadius.all(radiusXl);
  static const BorderRadius brXxl = BorderRadius.all(radiusXxl);

  static const EdgeInsets page = EdgeInsets.symmetric(
    horizontal: pageH,
    vertical: pageV,
  );
  static const EdgeInsets card = EdgeInsets.all(cardH);
  static const EdgeInsets cardV2 = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: xxl,
  );
  static const EdgeInsets input = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: md,
  );
  static const EdgeInsets buttonLg = EdgeInsets.symmetric(
    horizontal: xxl,
    vertical: lg,
  );
  static const EdgeInsets buttonSm = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: sm,
  );
}

class Shadows {
  Shadows._();

  static const sm = BoxShadow(
    color: Color(0x0A000000),
    blurRadius: 4,
    offset: Offset(0, 1),
  );

  static const md = BoxShadow(
    color: Color(0x0F000000),
    blurRadius: 8,
    offset: Offset(0, 2),
  );

  static const lg = BoxShadow(
    color: Color(0x14000000),
    blurRadius: 16,
    offset: Offset(0, 4),
  );

  static const xl = BoxShadow(
    color: Color(0x1A000000),
    blurRadius: 24,
    offset: Offset(0, 8),
  );

  static List<BoxShadow> card(Color borderColor) => [
    sm,
    BoxShadow(color: borderColor, blurRadius: 0, offset: const Offset(0, 0)),
  ];
}

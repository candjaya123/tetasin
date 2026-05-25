import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

Page<T> slideUpPage<T>({required LocalKey key, required Widget child}) {
  return CustomTransitionPage<T>(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 300),
    reverseTransitionDuration: const Duration(milliseconds: 250),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.04), end: Offset.zero)
            .animate(
              CurvedAnimation(
                parent: animation,
                curve: Curves.easeOut,
                reverseCurve: Curves.easeIn,
              ),
            ),
        child: FadeTransition(opacity: animation, child: child),
      );
    },
  );
}

Page<T> fadePage<T>({required LocalKey key, required Widget child}) {
  return CustomTransitionPage<T>(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 250),
    reverseTransitionDuration: const Duration(milliseconds: 200),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(opacity: animation, child: child);
    },
  );
}

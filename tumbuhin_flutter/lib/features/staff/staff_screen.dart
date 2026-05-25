import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'providers/staff_providers.dart';
import '../../../shared/models/staff.dart';
import '../../../shared/widgets/polish_widgets.dart';

import '../../../core/theme/responsive.dart';

class StaffScreen extends ConsumerWidget {
  const StaffScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final staffAsync = ref.watch(staffListProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Manajemen Tim',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: staffAsync.when(
            data: (staff) => staff.isEmpty
                ? const EmptyStateWidget(
                    title: 'Belum ada staf',
                    message:
                        'Undang staf Anda untuk bergabung dan membantu operasional bisnis.',
                    icon: HugeIcons.strokeRoundedUserGroup,
                  )
                : AppRefreshIndicator(
                    onRefresh: () => ref.refresh(staffListProvider.future),
                    child: Responsive(
                      mobile: ListView.builder(
                        padding: const EdgeInsets.all(20),
                        itemCount: staff.length,
                        itemBuilder: (context, index) {
                          Widget content;
                          if (index == 0) {
                            content = Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildHeader(),
                                const SizedBox(height: 20),
                                _StaffCard(member: staff[index]),
                              ],
                            );
                          } else {
                            content = _StaffCard(member: staff[index]);
                          }

                          return content
                              .animate()
                              .fadeIn(duration: 400.ms, delay: (index * 50).ms)
                              .slideX(
                                begin: 0.1,
                                end: 0,
                                curve: Curves.easeOutQuad,
                              );
                        },
                      ),
                      tablet: SingleChildScrollView(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildHeader(),
                            const SizedBox(height: 24),
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate:
                                  SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: context.screenWidth > 900
                                        ? 3
                                        : 2,
                                    childAspectRatio: 2.5,
                                    crossAxisSpacing: 16,
                                    mainAxisSpacing: 16,
                                  ),
                              itemCount: staff.length,
                              itemBuilder: (context, index) {
                                return _StaffCard(member: staff[index])
                                    .animate()
                                    .fadeIn(
                                      duration: 400.ms,
                                      delay: (index * 50).ms,
                                    )
                                    .scale(begin: const Offset(0.95, 0.95));
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
            loading: () => Responsive(
              mobile: ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: 4,
                itemBuilder: (context, index) => SkeletonLoader.listTile(),
              ),
              tablet: GridView.builder(
                padding: const EdgeInsets.all(24),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: context.screenWidth > 900 ? 3 : 2,
                  childAspectRatio: 2.5,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: 4,
                itemBuilder: (context, index) => SkeletonLoader.card(),
              ),
            ),
            error: (err, stack) => ErrorStateWidget(
              error: err.toString(),
              onRetry: () => ref.refresh(staffListProvider.future),
            ),
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: ElevatedButton.icon(
                onPressed: () => context.push('/staff/qr-join'),
                icon: const Icon(Icons.person_add_rounded),
                label: const Text(
                  'Undang Anggota Tim Baru',
                  style: TextStyle(fontWeight: FontWeight.w900),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFDB827),
                  foregroundColor: const Color(0xFF1A1A1A),
                  padding: const EdgeInsets.all(18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                  minimumSize: const Size(double.infinity, 60),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return const Row(
      children: [
        Icon(HugeIcons.strokeRoundedUserGroup, color: Color(0xFF1A1A1A)),
        SizedBox(width: 10),
        Text(
          'Tim Staf Aktif',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: Color(0xFF1A1A1A),
          ),
        ),
      ],
    );
  }
}

class _StaffCard extends StatelessWidget {
  final StaffAccount member;

  const _StaffCard({required this.member});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Icon(
                HugeIcons.strokeRoundedUser,
                size: 20,
                color: Colors.grey,
              ),
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member.fullName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  member.role.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF9CA3AF),
                  ),
                ),
              ],
            ),
          ),
          Row(
            children: [
              _ActionButton(
                icon: HugeIcons.strokeRoundedView,
                onPressed: () => _showLogs(context),
              ),
              const SizedBox(width: 8),
              _ActionButton(
                icon: HugeIcons.strokeRoundedDelete02,
                color: const Color(0xFFEF4444),
                onPressed: () {
                  // Logic for delete staff
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showLogs(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _StaffLogsSheet(member: member),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final Color color;

  const _ActionButton({
    required this.icon,
    required this.onPressed,
    this.color = const Color(0xFF4B5563),
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 20, color: color),
      ),
    );
  }
}

class _StaffLogsSheet extends ConsumerWidget {
  final StaffAccount member;

  const _StaffLogsSheet({required this.member});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logsAsync = ref.watch(staffLogsProvider(member.id));

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        children: [
          _buildHandle(),
          Padding(
            padding: const EdgeInsets.all(25),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Detail Aktivitas Staf',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    'Tutup',
                    style: TextStyle(
                      color: Color(0xFFEF4444),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          _buildStaffSummary(),
          Expanded(
            child: logsAsync.when(
              data: (logs) => logs.isEmpty
                  ? const Center(
                      child: Text(
                        'Belum ada aktivitas tercatat',
                        style: TextStyle(color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 25),
                      itemCount: logs.length,
                      itemBuilder: (context, index) {
                        final log = logs[index];
                        return Container(
                          padding: const EdgeInsets.symmetric(vertical: 15),
                          decoration: const BoxDecoration(
                            border: Border(
                              bottom: BorderSide(color: Color(0xFFF3F4F6)),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                log.action,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                DateFormat(
                                  'dd MMM yyyy, HH:mm',
                                ).format(log.createdAt),
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: Color(0xFF9CA3AF),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, s) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHandle() {
    return Container(
      margin: const EdgeInsets.only(top: 10),
      width: 40,
      height: 4,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  Widget _buildStaffSummary() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 25, vertical: 10),
      padding: const EdgeInsets.all(15),
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            member.fullName,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          Text(
            member.role.toUpperCase(),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFFFDB827),
            ),
          ),
          Text(
            'ID: ${member.id.substring(0, 12)}...',
            style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF)),
          ),
        ],
      ),
    );
  }
}

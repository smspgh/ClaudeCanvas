import 'package:flutter/material.dart';

/// Icon component for displaying Material icons
class CcIcon extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcIcon({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  Widget build(BuildContext context) {
    final name = component['name'] as String? ?? 'circle';
    final size = (component['size'] as num?)?.toDouble() ?? 24;
    final color = _parseColor(component['color'] as String?);

    return Icon(
      _getIconData(name),
      size: size,
      color: color,
    );
  }

  IconData _getIconData(String name) {
    // Map common icon names to Material icons
    final iconMap = <String, IconData>{
      'add': Icons.add,
      'plus': Icons.add,
      'remove': Icons.remove,
      'minus': Icons.remove,
      'edit': Icons.edit,
      'delete': Icons.delete,
      'save': Icons.save,
      'cancel': Icons.cancel,
      'close': Icons.close,
      'check': Icons.check,
      'check_circle': Icons.check_circle,
      'settings': Icons.settings,
      'search': Icons.search,
      'home': Icons.home,
      'person': Icons.person,
      'user': Icons.person,
      'account_circle': Icons.account_circle,
      'email': Icons.email,
      'mail': Icons.mail,
      'phone': Icons.phone,
      'send': Icons.send,
      'refresh': Icons.refresh,
      'download': Icons.download,
      'upload': Icons.upload,
      'share': Icons.share,
      'favorite': Icons.favorite,
      'favorite_border': Icons.favorite_border,
      'heart': Icons.favorite,
      'star': Icons.star,
      'star_border': Icons.star_border,
      'info': Icons.info,
      'info_outline': Icons.info_outline,
      'warning': Icons.warning,
      'error': Icons.error,
      'error_outline': Icons.error_outline,
      'help': Icons.help,
      'help_outline': Icons.help_outline,
      'play_arrow': Icons.play_arrow,
      'play': Icons.play_arrow,
      'pause': Icons.pause,
      'stop': Icons.stop,
      'skip_next': Icons.skip_next,
      'skip_previous': Icons.skip_previous,
      'volume_up': Icons.volume_up,
      'volume_down': Icons.volume_down,
      'volume_off': Icons.volume_off,
      'arrow_back': Icons.arrow_back,
      'arrow_forward': Icons.arrow_forward,
      'arrow_upward': Icons.arrow_upward,
      'arrow_downward': Icons.arrow_downward,
      'chevron_left': Icons.chevron_left,
      'chevron_right': Icons.chevron_right,
      'expand_more': Icons.expand_more,
      'expand_less': Icons.expand_less,
      'menu': Icons.menu,
      'more_vert': Icons.more_vert,
      'more_horiz': Icons.more_horiz,
      'notifications': Icons.notifications,
      'notifications_none': Icons.notifications_none,
      'calendar_today': Icons.calendar_today,
      'access_time': Icons.access_time,
      'schedule': Icons.schedule,
      'location_on': Icons.location_on,
      'place': Icons.place,
      'visibility': Icons.visibility,
      'visibility_off': Icons.visibility_off,
      'lock': Icons.lock,
      'lock_open': Icons.lock_open,
      'language': Icons.language,
      'attach_file': Icons.attach_file,
      'link': Icons.link,
      'image': Icons.image,
      'photo': Icons.photo,
      'camera': Icons.camera,
      'videocam': Icons.videocam,
      'mic': Icons.mic,
      'mic_off': Icons.mic_off,
      'folder': Icons.folder,
      'file_copy': Icons.file_copy,
      'content_copy': Icons.content_copy,
      'content_paste': Icons.content_paste,
      'format_bold': Icons.format_bold,
      'format_italic': Icons.format_italic,
      'format_underline': Icons.format_underlined,
      'format_list_bulleted': Icons.format_list_bulleted,
      'format_list_numbered': Icons.format_list_numbered,
      'code': Icons.code,
      'dashboard': Icons.dashboard,
      'analytics': Icons.analytics,
      'trending_up': Icons.trending_up,
      'trending_down': Icons.trending_down,
      'shopping_cart': Icons.shopping_cart,
      'credit_card': Icons.credit_card,
      'payment': Icons.payment,
    };

    return iconMap[name.toLowerCase()] ?? Icons.circle;
  }

  Color? _parseColor(String? color) {
    if (color == null) return null;
    if (color.startsWith('#')) {
      final hex = color.substring(1);
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      } else if (hex.length == 8) {
        return Color(int.parse(hex, radix: 16));
      }
    }
    // Named colors
    switch (color.toLowerCase()) {
      case 'white':
        return Colors.white;
      case 'black':
        return Colors.black;
      case 'red':
        return Colors.red;
      case 'blue':
        return Colors.blue;
      case 'green':
        return Colors.green;
      case 'yellow':
        return Colors.yellow;
      case 'orange':
        return Colors.orange;
      case 'purple':
        return Colors.purple;
      case 'grey':
      case 'gray':
        return Colors.grey;
      default:
        return null;
    }
  }
}

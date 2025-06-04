import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { useTheme } from '../../../contexts/ThemeContext';
import PackageInfo from '../../../package.json';

// Tập trung tất cả dữ liệu vào một đối tượng
 const appData = {
  // Thông tin ứng dụng
  app: {
    name: 'Rent House',
    version: PackageInfo.version || '1.0.0',
    buildNumber: '100',
    icon: require('@assets/images/adaptive-icon.png'),
    description: 'ỨNG DỤNG PHỤC VỤ CHO BÀI TẬP LỚN MÔN HỌC "CÁC CÔNG NGHỆ LẬP TRÌNH HIỆN ĐẠI" CỦA NHÓM SINH VIÊN KHOA CNTT TRƯỜNG ĐH MỞ TP.HCM.\nỨng dụng thuê và cho thuê nhà trọ, căn hộ với nhiều tính năng tiện ích.'
  },
  
  // Đội ngũ phát triển
  developers: [
    { 
      name: 'Nguyễn Thanh Triều', 
      role: 'Lead Developer, Backend Developer', 
      email: 'trieukon1011@gmail.com',
      iconName: 'mail-outline'
    },
    { 
      name: 'Vương Minh Trí', 
      role: 'Front-end Developer', 
      email: 'minhtri4724@gmail.com',
      iconName: 'mail-outline'
    }
  ],
  
  // Công nghệ sử dụng
  technologies: [
    { name: 'React Native', version: '0.71.0', icon: 'logo-react' },
    { name: 'Expo', version: '48.0.0', icon: 'layers-outline' },
    { name: 'Django REST Framework', version: '3.14.0', icon: 'server-outline' }
  ],
  
  // Liên kết
  links: [
    {
      title: 'Mã nguồn GitHub',
      url: 'https://github.com/konnn04/rent-house-app',
      icon: 'logo-github'
    }
    // Có thể thêm các liên kết khác (đã bị comment) vào đây
    // { title: 'Chính sách bảo mật', url: 'https://example.com/privacy', icon: 'shield-checkmark-outline' },
    // { title: 'Điều khoản sử dụng', url: 'https://example.com/terms', icon: 'document-text-outline' },
    // { title: 'Trợ giúp & Hỗ trợ', url: 'https://example.com/help', icon: 'help-circle-outline' }
  ],
  
  // Lịch sử phiên bản
  changelog: [
    {
      version: '1.0.0',
      date: '13/05/2025',
      changes: [
        'Ra mắt phiên bản chính thức',
        'Tính năng đăng ký, đăng nhập',
        'Tìm kiếm, xem chi tiết nhà trọ',
        'Đặt lịch xem nhà',
        'Đánh giá và bình luận'
      ]
    },
    {
      version: '0.9.5',
      date: '01/05/2025',
      changes: [
        'Phiên bản thử nghiệm cuối cùng',
        'Sửa lỗi giao diện',
        'Cải thiện hiệu suất'
      ]
    }
  ],
  
  copyright: '© 2025 Rent House Team. All rights reserved.'
};

export const AboutAppScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Không thể mở URL: ${url}`);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Thông tin ứng dụng</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  const renderAppInfo = () => (
    <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.appInfoContainer}>
        <Image 
          source={appData.app.icon} 
          style={styles.appIcon} 
        />
        <Text style={[styles.appName, { color: colors.textPrimary }]}>{appData.app.name}</Text>
        <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
          Phiên bản {appData.app.version} (Build {appData.app.buildNumber})
        </Text>
      </View>
      <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
        {appData.app.description}
      </Text>
    </View>
  );

  const renderDevelopers = () => (
    <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Đội ngũ phát triển</Text>
      <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
      
      {appData.developers.map((dev, index) => (
        <View key={index} style={styles.developerContainer}>
          <View style={styles.developerInfo}>
            <Text style={[styles.developerName, { color: colors.textPrimary }]}>{dev.name}</Text>
            <Text style={[styles.developerRole, { color: colors.textSecondary }]}>{dev.role}</Text>
          </View>
          <TouchableOpacity
            onPress={() => openLink(`mailto:${dev.email}`)}
            style={[styles.contactButton, { backgroundColor: colors.accentColor }]}
          >
            <Ionicons name={dev.iconName} size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderTechnologies = () => (
    <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Công nghệ sử dụng</Text>
      <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
      
      {appData.technologies.map((tech, index) => (
        <View key={index} style={styles.technologyContainer}>
          <Ionicons name={tech.icon} size={20} color={colors.accentColor} style={styles.techIcon} />
          <Text style={[styles.technologyName, { color: colors.textPrimary }]}>{tech.name}</Text>
          <Text style={[styles.technologyVersion, { color: colors.textSecondary }]}>v{tech.version}</Text>
        </View>
      ))}
    </View>
  );

  const renderLinks = () => (
    <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Liên kết</Text>
      <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
      
      {appData.links.map((link, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.linkItem}
          onPress={() => openLink(link.url)}
        >
          <Ionicons name={link.icon} size={20} color={colors.accentColor} />
          <Text style={[styles.linkText, { color: colors.textPrimary }]}>{link.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChangelog = () => (
    <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Lịch sử phiên bản</Text>
      <Divider style={{ backgroundColor: colors.borderColor, marginVertical: 10 }} />
      
      {appData.changelog.map((version, index) => (
        <View key={index} style={styles.versionItem}>
          <View style={styles.versionHeader}>
            <Text style={[styles.versionNumber, { color: colors.textPrimary }]}>{version.version}</Text>
            <Text style={[styles.versionDate, { color: colors.textSecondary }]}>{version.date}</Text>
          </View>
          <Text style={[styles.changelogText, { color: colors.textSecondary }]}>
            {version.changes.map(change => `• ${change}\n`)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderFooter = () => (
    <View style={[styles.footer, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.copyright, { color: colors.textSecondary }]}>
        {appData.copyright}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderAppInfo()}
        {renderDevelopers()}
        {renderTechnologies()}
        {renderLinks()}
        {renderChangelog()}
        {renderFooter()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 5,
  },
  appDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  developerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  developerRole: {
    fontSize: 14,
  },
  contactButton: {
    padding: 8,
    borderRadius: 20,
  },
  technologyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  techIcon: {
    marginRight: 10,
  },
  technologyName: {
    flex: 1,
    fontSize: 15,
  },
  technologyVersion: {
    fontSize: 14,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  linkText: {
    fontSize: 15,
    marginLeft: 10,
  },
  versionItem: {
    marginBottom: 15,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionDate: {
    fontSize: 14,
  },
  changelogText: {
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
  },
});

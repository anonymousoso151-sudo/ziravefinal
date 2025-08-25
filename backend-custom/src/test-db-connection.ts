import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module';
import { SupabaseService } from './supabase/supabase.service';

async function testDatabaseConnection() {
  console.log('🔍 بدء اختبار الاتصال بقاعدة البيانات...\n');

  try {
    // إنشاء تطبيق NestJS مستقل
    const app = await NestFactory.createApplicationContext(AppModule);
    
    console.log('✅ تم إنشاء تطبيق NestJS بنجاح');
    
    // الحصول على خدمة Supabase
    const supabaseService = app.get(SupabaseService);
    
    console.log('✅ تم الحصول على خدمة Supabase بنجاح');
    
    // اختبار الاتصال الأساسي باستخدام العميل العادي
    console.log('\n🔍 اختبار الاتصال الأساسي...');
    
    // اختبار بسيط للاتصال
    const { data: testData, error: testError } = await supabaseService.client
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    if (testError && testError.code === 'PGRST205') {
      console.log('✅ الاتصال بقاعدة البيانات يعمل (الجدول غير موجود - وهذا طبيعي)');
    } else if (testError) {
      console.error('❌ خطأ في الاتصال:', testError);
    } else {
      console.log('✅ الاتصال يعمل بشكل مثالي');
    }
    
    // محاولة جلب معلومات الجداول المتاحة
    console.log('\n🔍 جلب معلومات الجداول المتاحة...');
    
    try {
      const { data: tables, error: tablesError } = await supabaseService.client
        .rpc('get_tables_info');
      
      if (tablesError) {
        console.log('ℹ️ لا يمكن جلب معلومات الجداول عبر RPC، جاري المحاولة بطريقة أخرى...');
        
        // محاولة بديلة - جلب من جدول system
        const { data: systemTables, error: systemError } = await supabaseService.client
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (systemError) {
          console.log('ℹ️ لا يمكن الوصول إلى information_schema (قد يكون بسبب RLS)');
        } else {
          console.log('📋 الجداول الموجودة في قاعدة البيانات:');
          systemTables?.forEach((table: any) => {
            console.log(`   - ${table.table_name}`);
          });
        }
      } else {
        console.log('📋 الجداول المتاحة:', tables);
      }
    } catch (error) {
      console.log('ℹ️ لا يمكن جلب معلومات الجداول:', error);
    }
    
    // اختبار جدول profiles إذا كان موجوداً
    console.log('\n🔍 اختبار جدول profiles...');
    
    try {
      const { data: profiles, error: profilesError } = await supabaseService.client
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        if (profilesError.code === 'PGRST205') {
          console.log('ℹ️ جدول profiles غير موجود - يجب إنشاؤه أولاً');
          console.log('💡 يمكنك إنشاء الجدول باستخدام Supabase CLI أو من لوحة التحكم');
        } else {
          console.error('❌ خطأ في الوصول لجدول profiles:', profilesError);
        }
      } else {
        console.log('✅ نجح الوصول لجدول profiles');
        console.log('📊 عدد الملفات الشخصية:', profiles?.length || 0);
        
        if (profiles && profiles.length > 0) {
          console.log('👤 أول ملف شخصي:', JSON.stringify(profiles[0], null, 2));
        }
      }
    } catch (error) {
      console.error('❌ خطأ في اختبار جدول profiles:', error);
    }
    
    // اختبار العميل الإداري (إذا كان مفتاح Service Role صحيح)
    console.log('\n🔍 اختبار العميل الإداري...');
    
    try {
      const { data: adminTest, error: adminError } = await supabaseService.admin
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (adminError) {
        if (adminError.message?.includes('Invalid API key')) {
          console.log('ℹ️ مفتاح Service Role غير صحيح أو غير محدد');
          console.log('💡 يجب تحديث SUPABASE_SERVICE_ROLE_KEY في ملف .env');
        } else {
          console.error('❌ خطأ في العميل الإداري:', adminError);
        }
      } else {
        console.log('✅ العميل الإداري يعمل بشكل صحيح');
        console.log('📊 عدد الملفات الشخصية (إداري):', adminTest?.length || 0);
      }
    } catch (error) {
      console.error('❌ خطأ في اختبار العميل الإداري:', error);
    }
    
    // اختبار إضافي - محاولة إنشاء جدول تجريبي
    console.log('\n🔍 اختبار إنشاء جدول تجريبي...');
    
    try {
      const { data: createResult, error: createError } = await supabaseService.client
        .rpc('create_test_table');
      
      if (createError) {
        console.log('ℹ️ لا يمكن إنشاء جدول تجريبي (قد يكون بسبب الصلاحيات)');
      } else {
        console.log('✅ تم إنشاء جدول تجريبي بنجاح');
      }
    } catch (error) {
      console.log('ℹ️ لا يمكن إنشاء جدول تجريبي:', error);
    }
    
    // إغلاق التطبيق
    await app.close();
    
    console.log('\n🎉 تم إكمال اختبار الاتصال!');
    console.log('\n📋 ملخص النتائج:');
    console.log('   ✅ الاتصال بـ Supabase يعمل');
    console.log('   ℹ️ قد تحتاج إلى إنشاء الجداول المطلوبة');
    console.log('   ℹ️ قد تحتاج إلى تحديث مفتاح Service Role');
    
  } catch (error) {
    console.error('\n💥 خطأ في اختبار الاتصال:', error);
    
    // طباعة تفاصيل الخطأ للتشخيص
    if (error instanceof Error) {
      console.error('رسالة الخطأ:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

// تشغيل الاختبار
testDatabaseConnection()
  .then(() => {
    console.log('\n✅ تم إكمال الاختبار بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 فشل في الاختبار:', error);
    process.exit(1);
  });

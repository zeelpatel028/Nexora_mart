# NMART Proguard Rules
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Retrofit & Gson rules
-keep class com.nexora.nmart.data.model.** { *; }
-keepclassmembers class com.nexora.nmart.data.model.** { *; }
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

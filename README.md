# RSS-CI

一个基于 CI 的 RSS 生成工具。

## 使用方法

1）fork 这个项目。

2）在`config.json`的`sites`属性中添加你想订阅的站点。属性为：

+   `name`：RSS XML 的文件名。
+   `url`：文章列表页面的 URL。
+   `base`：文章 URL 的前缀。
+   `articles`：文章列表页面中，文章链接的 CSS 选择器。
+   `content`：文章页面中，正文部分的 CSS 选择器，注意是文章页面。
+   `remove`：选择文章或正文时，需要排除的元素。
+   `epub`：如果为真则生成 EPUB。

3）更新`.travis.yml`的`env.global`部分。

+   `GH_UN`：你的 Github 用户名（用于提交）
+   `GH_EMAIL`：你的 Github 邮箱（用于提交）
+   `GH_USER`：仓库所在的用户
+   `GH_REPO`：仓库名称
+   `GH_BRANCH`：要提交的分支

4）访问`travis-ci.org/{用户名}/{仓库}`，开启 CI。

![](http://ww1.sinaimg.cn/large/841aea59ly1fxd7aw17xtj20n50ig759.jpg)

5）在环境变量中设置`GH_TOKEN`，就是你的 Github 访问 Token。

![](http://ww1.sinaimg.cn/large/841aea59ly1fxd7bqpwbij21320b0wf9.jpg)

6）设置 CRON。

![](http://ww1.sinaimg.cn/large/841aea59ly1fxd7cctc2vj212y059jrg.jpg)

7）Travis 构建完成后，访问`https://{用户名}.github.io/{仓库}/{站点}.xml`。
